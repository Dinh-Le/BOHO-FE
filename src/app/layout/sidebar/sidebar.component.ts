import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { Store, select } from '@ngrx/store';
import { catchError, debounceTime, fromEvent, of, switchMap, zip } from 'rxjs';
import { Device } from 'src/app/data/schema/boho-v2/device';
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
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit {
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

  mode: string = '';
  autoHideEnabled: boolean = false;
  root?: TreeViewItemModel;
  isLoading: boolean = true;
  selectedItems: TreeViewItemModel[] = [];
  searchText: string = '';

  get showCheckbox() {
    return this._navigationService.level1 === Level1Menu.SEARCH;
  }

  ngOnInit(): void {
    this.store
      .pipe(select('sidebar'), select('viewMode'))
      .subscribe((viewMode) => {
        switch (viewMode) {
          case ViewMode.Logical:
            this.setViewMode('by-node');
            break;
          case ViewMode.Geolocation:
            this.setViewMode('by-group');
            break;
        }
      });

    this.store.dispatch(
      SidebarActions.setViewMode({ viewMode: ViewMode.Logical })
    );

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
        }
      }
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

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.autoHideEnabled) {
        this.store.dispatch(SidebarActions.hide());
      }
    }
  }

  onCheckboxChanged(item: TreeViewItemModel) {
    item.traverse((child) => {
      child.checked = item.checked;

      const isDevice = child.id.startsWith(DeviceTreeBuilder.DeviceIDPrefix);
      if (!isDevice) {
        return;
      }
      if (item.checked) {
        this._navigationService.selectedDeviceIds.add(child.data.id);
      } else {
        this._navigationService.selectedDeviceIds.delete(child.data.id);
      }
    });
  }

  onMenuItemClick(event: TreeViewItemModel[]) {
    this.selectedItems = event as TreeViewItemModel[];

    if (this._navigationService.level1 === Level1Menu.SEARCH) {
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

  setViewMode(value: string) {
    if (this.mode === value) {
      return;
    }

    this.mode = value;

    if (this.mode === 'by-node') {
      this.loadLogical();
    } else if (this.mode === 'by-group') {
      this.loadGeolocation();
    }
  }

  private loadGeolocation(): void {
    const builder = new DeviceTreeBuilder();
    builder.setViewMode(ViewMode.Geolocation);

    this.isLoading = true;

    zip(
      this._groupService.findAll(),
      this._groupManagementService.findAll(),
      this._nodeService.findAll()
    )
      .pipe(
        switchMap((responses) => {
          const [
            findAllGroupResponse,
            findAllGroupManagementResponse,
            findAllNodeResponse,
          ] = responses;

          if (!findAllGroupResponse.success) {
            throw Error(
              'Fetch group data failed with error: ' +
                findAllGroupResponse.message
            );
          }

          if (!findAllGroupManagementResponse.success) {
            throw Error(
              'Fetch group management data failed with error: ' +
                findAllGroupManagementResponse.message
            );
          }

          if (!findAllNodeResponse.success) {
            throw Error(
              'Fetch node data failed with error: ' +
                findAllNodeResponse.message
            );
          }

          builder.setGroups(findAllGroupResponse.data);
          builder.setGroupManagements(findAllGroupManagementResponse.data);
          builder.setNodes(findAllNodeResponse.data);

          return zip(
            findAllNodeResponse.data.map((node) =>
              this._deviceService.findAll(node.id)
            )
          );
        }),
        switchMap((responses) => {
          const devices = responses
            .filter((e) => e.success)
            .reduce<Device[]>((acc, e) => [...acc, ...e.data], []);
          builder.setDevices(devices);
          return of(builder.build());
        })
      )
      .subscribe({
        next: (root) => {
          this.root = root;
        },
        error: ({ message }) => this._toastService.showError(message),
        complete: () => (this.isLoading = false),
      });
  }

  private loadLogical(): void {
    const builder = new DeviceTreeBuilder();
    builder.setViewMode(ViewMode.Logical);

    this.isLoading = true;

    zip(this._nodeOperatorService.findAll(), this._nodeService.findAll())
      .pipe(
        switchMap((responses) => {
          const [findAllNodeOperatorResponse, findAllNodeResponse] = responses;

          if (!findAllNodeOperatorResponse.success) {
            throw Error(
              'Fetch node operator data failed with error: ' +
                findAllNodeOperatorResponse.message
            );
          }

          if (!findAllNodeResponse.success) {
            throw Error(
              'Fetch node data failed with error: ' +
                findAllNodeResponse.message
            );
          }

          builder.setNodeOperators(findAllNodeOperatorResponse.data);
          builder.setNodes(findAllNodeResponse.data);

          return zip(
            findAllNodeResponse.data.map((node) =>
              this._deviceService.findAll(node.id).pipe(
                catchError(({ message }) =>
                  of({
                    success: false,
                    message,
                    data: [],
                  })
                )
              )
            )
          );
        }),
        switchMap((responses) => {
          const devices = responses
            .filter((e) => e.success)
            .reduce<Device[]>((acc, e) => [...acc, ...e.data], []);
          builder.setDevices(devices);
          return of(builder.build());
        })
      )
      .subscribe({
        next: (root) => {
          this.root = root;
        },
        error: ({ message }) => this._toastService.showError(message),
        complete: () => (this.isLoading = false),
      });
  }
}
