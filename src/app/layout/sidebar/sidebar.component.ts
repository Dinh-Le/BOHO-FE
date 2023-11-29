import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { Store } from '@ngrx/store';
import {
  of,
  switchMap,
  zip,
} from 'rxjs';
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

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private _nodeOperatorService = inject(NodeOperatorService);
  private _nodeService = inject(NodeService);
  private _deviceService = inject(DeviceService);
  private _groupService = inject(GroupService);
  private _groupManagementService = inject(GroupManagementService);
  private _toastService = inject(ToastService);

  private eRef = inject(ElementRef);
  private store: Store<{ sidebar: SidebarState }> = inject(
    Store<{ sidebar: SidebarState }>
  );

  @ViewChild('menu') menu!: ElementRef;

  mode: string = '';
  autoHideEnabled: boolean = false;
  root?: TreeViewItemModel;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.setViewMode('by-node');
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.autoHideEnabled) {
        this.store.dispatch(SidebarActions.hide());
      }
    }
  }

  // onMenuItemClick(item: MenuItem) {
  //   this.store.dispatch(SidebarActions.selectMenuItem({ item: item }));
  // }

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
}
