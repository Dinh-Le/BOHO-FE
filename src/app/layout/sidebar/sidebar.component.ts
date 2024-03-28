import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { Store, select } from '@ngrx/store';
import {
  EMPTY,
  Observable,
  Subscription,
  catchError,
  concat,
  debounceTime,
  finalize,
  fromEvent,
  of,
  switchMap,
  tap,
  toArray,
  zip,
} from 'rxjs';
import {
  Device,
  Group,
  GroupManagement,
  Node,
  NodeOperator,
} from 'src/app/data/schema/boho-v2';
import { DeviceService } from 'src/app/data/service/device.service';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { NodeService } from 'src/app/data/service/node.service';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';
import { GroupService } from 'src/app/data/service/group.service';
import { GroupManagementService } from 'src/app/data/service/group-management.service';
import { DeviceTreeBuilder } from '@shared/helpers/device-tree-builder';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';
import { TreeViewItemModel } from '@shared/components/tree-view/tree-view-item.model';
import {
  Level1Menu,
  Level2Menu,
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  private _nodeOperatorService = inject(NodeOperatorService);
  private _nodeService = inject(NodeService);
  private _deviceService = inject(DeviceService);
  private _groupService = inject(GroupService);
  private _groupManagementService = inject(GroupManagementService);
  private _toastService = inject(ToastService);
  private _navigationService = inject(NavigationService);

  private eRef = inject(ElementRef);
  private store: Store<{ sidebar: SidebarState }> = inject(
    Store<{ sidebar: SidebarState }>
  );

  @ViewChild('menu') menu!: ElementRef;
  @ViewChild('searchDeviceInput') searchDeviceInput!: ElementRef;

  autoHideEnabled: boolean = false;
  root?: TreeViewItemModel;
  isLoading: boolean = true;
  selectedItems: TreeViewItemModel[] = [];
  searchText: string = '';
  private _subscriptions: Subscription[] = [];

  get showCheckbox() {
    return this._navigationService.level1 === Level1Menu.SEARCH;
  }

  get viewMode(): keyof typeof ViewMode {
    return this._navigationService.viewMode;
  }

  set viewMode(value: keyof typeof ViewMode) {
    if (
      ViewMode[value] == ViewMode.Geolocation &&
      this._navigationService.level2 == Level2Menu.NODE
    ) {
      return;
    }

    this._navigationService.viewMode = ViewMode[value];
  }

  getColor(item: TreeViewItemModel): string {
    if (item.id.startsWith(DeviceTreeBuilder.NodeIDPrefix)) {
      return item.data?.is_activate ? '#70ad46' : '#fe0000';
    }

    return item.data?.status === 'OFFLINE'
      ? '#fe0000'
      : item.data?.status === 'FAIL'
      ? '#ffc000'
      : '#70ad46';
  }

  ngOnInit(): void {
    const treeItemChangeSubscription =
      this._navigationService.treeItemChange$.subscribe(
        ({ type, action, data }) => {
          if (type === SideMenuItemType.NODE) {
            const id = DeviceTreeBuilder.NodeIDPrefix + data.id;

            if (action === 'create') {
              const nodeOperatorId =
                DeviceTreeBuilder.NodeOperatorIDPrefix + data.node_operator_id;
              const parent = this.root?.find(nodeOperatorId);
              if (!parent) {
                console.log(
                  `The parent with id ${nodeOperatorId} does not exists`
                );
                return;
              }
              const item = new TreeViewItemModel(
                id,
                data.name,
                DeviceTreeBuilder.NodeIcon
              );
              item.data = data;
              parent.add(item);
            } else if (action === 'update') {
              const item = this.root?.find(id);
              if (!item) {
                console.log(`The node with id ${id} does not exits`);
                return;
              }

              item.label = data.name;
            } else if (action === 'delete') {
              this.root?.remove(id);
            } else {
              // Do nothing
            }
          } else if (type === SideMenuItemType.DEVICE) {
            const id = DeviceTreeBuilder.DeviceIDPrefix + data.id;

            if (action === 'create') {
              const nodeId =
                this.viewMode === ViewMode.Logical
                  ? DeviceTreeBuilder.NodeIDPrefix + data.node_id
                  : DeviceTreeBuilder.GroupIDPrefix + data.group_id;
              const parent = this.root?.find(nodeId);
              if (!parent) {
                console.log(`The parent with id ${nodeId} does not exists`);
                return;
              }
              const item = new TreeViewItemModel(
                id,
                data.name,
                DeviceTreeBuilder.DeviceIcon
              );
              item.data = data;
              parent.add(item);
            } else if (action === 'update') {
              const item = this.root?.find(id);
              if (!item) {
                console.log(`The node with id ${id} does not exits`);
                return;
              }

              item.label = data.name;
            } else if (action === 'delete') {
              this.root?.remove(id);
            } else {
              // Do nothing
            }
          } else if (type === SideMenuItemType.NODE_OPERATOR) {
            const id = DeviceTreeBuilder.NodeOperatorIDPrefix + data.id;
            if (action === 'create') {
              const item = new TreeViewItemModel(
                id,
                data.name,
                DeviceTreeBuilder.NodeOperatorIcon
              );
              item.data = data;
              this.root?.add(item);
            } else if (action === 'update') {
              const item = this.root?.find(id);
              if (!item) {
                console.log(`The node with id ${id} does not exits`);
                return;
              }

              item.label = data.name;
            } else if (action === 'delete') {
              this.root?.remove(id);
            } else {
              // Do nothing
            }
          } else if (type === SideMenuItemType.GROUP) {
            const id = DeviceTreeBuilder.GroupIDPrefix + data.id;

            if (action === 'create') {
              const item = new TreeViewItemModel(
                id,
                data.name,
                DeviceTreeBuilder.NodeOperatorIcon
              );
              item.data = data;
              this.root?.add(item);
            } else if (action === 'update') {
              const item = this.root?.find(id);
              if (!item) {
                console.log(`The node with id ${id} does not exits`);
                return;
              }

              item.label = data.name;
            } else if (action === 'delete') {
              this.root?.remove(id);
            } else {
              // Do nothing
            }
          }
        }
      );
    this._subscriptions.push(treeItemChangeSubscription);

    const viewModeChangeSubscription = this._navigationService.viewModeChange$
      .pipe(
        tap(() => (this.isLoading = true)),
        switchMap((viewMode) =>
          viewMode === ViewMode.Logical
            ? this.loadLogical()
            : this.loadGeolocation()
        ),
        tap(() => (this.isLoading = false))
      )
      .subscribe({
        next: (root) => {
          let nodeId: string = '';
          switch (this._navigationService.sideMenu.type) {
            case SideMenuItemType.GROUP:
              nodeId =
                DeviceTreeBuilder.GroupIDPrefix +
                this._navigationService.sideMenu.id;
              break;
            case SideMenuItemType.NODE_OPERATOR:
              nodeId =
                DeviceTreeBuilder.NodeOperatorIDPrefix +
                this._navigationService.sideMenu.id;
              break;
            case SideMenuItemType.NODE:
              nodeId =
                DeviceTreeBuilder.NodeIDPrefix +
                this._navigationService.sideMenu.id;
              break;
            case SideMenuItemType.DEVICE:
              nodeId =
                DeviceTreeBuilder.DeviceIDPrefix +
                this._navigationService.sideMenu.id;
              break;
            default:
              nodeId = 'user-0';
              break;
          }

          const item = root.find(nodeId);
          this.selectedItems = [item ?? root];
          this.root = root;
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    this._subscriptions.push(viewModeChangeSubscription);

    this._navigationService.viewModeChange$.next(
      this._navigationService.viewMode
    );
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchDeviceInput.nativeElement as HTMLInputElement, 'input')
      .pipe(debounceTime(500))
      .subscribe((ev: Event) => {
        const el = ev.target as HTMLInputElement;
        this.searchText = el.value;
      });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.autoHideEnabled) {
        this.store.dispatch(SidebarActions.hide());
      }
    }
  }

  onCheckboxChanged(item: TreeViewItemModel) {
    const selectedDevicesMap: Map<number, any> =
      this._navigationService.selectedDevices$
        .getValue()
        .reduce(
          (map: Map<any, any>, device: any) => map.set(device.id, device),
          new Map<number, any>()
        );

    item.traverse((child) => {
      child.checked = item.checked;

      const isDevice = child.id.startsWith(DeviceTreeBuilder.DeviceIDPrefix);
      if (!isDevice) {
        return;
      }

      const device = child.data;
      if (child.checked) {
        selectedDevicesMap.set(device.id, device);
      } else {
        selectedDevicesMap.delete(device.id);
      }
    });
    this._navigationService.selectedDevices$.next(
      Array.from(selectedDevicesMap.values())
    );
  }

  onMenuItemClick(event: TreeViewItemModel[]) {
    this.selectedItems = event as TreeViewItemModel[];

    if (this._navigationService.level1 === Level1Menu.SEARCH) {
      return;
    } else if (this._navigationService.level1 === Level1Menu.ALERT) {
      const devices: any[] = [];

      this.selectedItems[0].traverse((item) => {
        if (item.id.startsWith(DeviceTreeBuilder.DeviceIDPrefix)) {
          devices.push(item.data);
        }
      });

      this._navigationService.selectedDevices$.next(devices);
      return;
    }

    const item = this.selectedItems[0];

    let type = SideMenuItemType.USER;
    if (item.id.startsWith(DeviceTreeBuilder.NodeOperatorIDPrefix)) {
      type = SideMenuItemType.NODE_OPERATOR;
    } else if (item.id.startsWith(DeviceTreeBuilder.NodeIDPrefix)) {
      type = SideMenuItemType.NODE;
    } else if (item.id.startsWith(DeviceTreeBuilder.DeviceIDPrefix)) {
      type = SideMenuItemType.DEVICE;
    } else if (item.id.startsWith(DeviceTreeBuilder.GroupIDPrefix)) {
      type = SideMenuItemType.GROUP;
    }

    this._navigationService.sideMenu = {
      id: item.data?.id,
      type,
      data: item.data,
    };
    this._navigationService.navigate();
  }

  private loadGeolocation(): Observable<TreeViewItemModel> {
    const builder = new DeviceTreeBuilder();
    builder.setViewMode(ViewMode.Geolocation);

    return concat(
      this._groupService.findAll(),
      this._groupManagementService.findAll(),
      this._nodeService.findAll()
    ).pipe(
      toArray(),
      switchMap((responses) => {
        const groups = responses[0].data as Group[];
        const groupManagements = responses[1].data as GroupManagement[];
        const nodes = responses[2].data as Node[];

        builder.setGroups(groups ?? []);
        builder.setGroupManagements(groupManagements ?? []);
        builder.setNodes(nodes ?? []);

        return concat(
          ...nodes.map((node) => this._deviceService.findAll(node.id))
        );
      }),
      toArray(),
      switchMap((responses) => {
        const devices = responses.reduce<Device[]>(
          (acc, r) => [...acc, ...(r.data ?? [])],
          []
        );
        builder.setDevices(devices);
        return of(builder.build());
      })
    );
  }

  private loadLogical(): Observable<TreeViewItemModel> {
    const builder = new DeviceTreeBuilder();

    return concat(
      this._nodeOperatorService.findAll(),
      this._nodeService.findAll()
    ).pipe(
      toArray(),
      switchMap((responses) => {
        const nodeOperators = responses[0].data as NodeOperator[];
        const nodes = responses[1].data as Node[];

        builder.setNodeOperators(nodeOperators ?? []);
        builder.setNodes(nodes ?? []);

        return concat(
          ...nodes.map((node) => this._deviceService.findAll(node.id))
        );
      }),
      toArray(),
      switchMap((responses) => {
        const devices = responses.reduce<Device[]>(
          (acc, r) => [...acc, ...(r.data ?? [])],
          []
        );

        builder.setViewMode(ViewMode.Logical);
        builder.setDevices(devices);
        return of(builder.build());
      })
    );
  }
}
