import {
  Component,
  OnInit,
  inject,
  ɵclearResolutionOfComponentResourcesQueue,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { FormDialogComponent } from '@modules/manage/form-dialog/form-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TreeViewItemModel } from '@shared/components/tree-view/tree-view-item.model';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';
import { SharedModule } from '@shared/shared.module';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  from,
  mergeAll,
  mergeMap,
  map,
  of,
  switchMap,
  zip,
} from 'rxjs';
import {
  Device,
  GroupManagement,
  Node,
  NodeOperator,
} from 'src/app/data/schema/boho-v2';
import { DeviceService } from 'src/app/data/service/device.service';
import { GroupManagementService } from 'src/app/data/service/group-management.service';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { NodeService } from 'src/app/data/service/node.service';
import { DeviceTreeBuilder } from './device-tree-builder';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListViewItemModel } from '@shared/components/list-view/list-view-item.model';
import { InvalidId } from 'src/app/data/constants';
import { text } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-manage-camera',
  templateUrl: 'manage-camera.component.html',
  styleUrls: ['manage-camera.component.scss'],
  standalone: true,
  imports: [CommonModule, FormDialogComponent, SharedModule, FormsModule],
})
export class ManageCameraComponent implements OnInit {
  private _activeModal = inject(NgbActiveModal);
  private _nodeOperatorService = inject(NodeOperatorService);
  private _nodeService = inject(NodeService);
  private _deviceService = inject(DeviceService);
  private _groupManagementService = inject(GroupManagementService);
  private _toastService = inject(ToastService);

  id!: string;
  name!: string;

  private _searchTextSubject = new Subject<string>();
  searchText = '';

  deviceListItems: ListViewItemModel[] = [];
  devicesToRemove: ListViewItemModel[] = [];

  treeViewData!: TreeViewItemModel;
  devicesToAdd: TreeViewItemModel[] = [];

  ngOnInit(): void {
    this._searchTextSubject
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((text) => {
        this.searchText = text;
      });

    let nodeOperators: NodeOperator[] = [];
    let nodes: Node[] = [];
    let groupManagements: GroupManagement[] = [];
    let devices: Device[] = [];

    zip(
      this._nodeOperatorService.findAll(),
      this._nodeService.findAll(),
      this._groupManagementService.findAll(this.id)
    )
      .pipe(
        switchMap((responses) => {
          const [
            findAllNodeOperatorResponse,
            findAllNodeResponse,
            findAllGroupManagementResponse,
          ] = responses;

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

          if (!findAllGroupManagementResponse.success) {
            throw Error(
              'Fetch group management data failed with error: ' +
                findAllGroupManagementResponse.message
            );
          }

          nodeOperators = findAllNodeOperatorResponse.data;
          nodes = findAllNodeResponse.data;

          if (Array.isArray(findAllGroupManagementResponse.data)) {
            groupManagements = findAllGroupManagementResponse.data;
          }

          return zip(nodes.map((node) => this._deviceService.findAll(node.id)));
        }),
        mergeAll(),
        switchMap((response) => {
          if (!response.message) {
            throw Error('Fetch device failed with error: ' + response.message);
          }

          devices.push(...response.data);
          return of(true);
        })
      )
      .subscribe({
        next: () => {
          this.treeViewData = new DeviceTreeBuilder()
            .setViewMode(ViewMode.Logical)
            .setNodeOperators(nodeOperators)
            .setNodes(nodes)
            .setDevices(devices)
            .build();

          this.deviceListItems = groupManagements.map((e) => {
            const device = devices.find(
              (x) => x.id.toString() == e.device_id.toString()
            );
            return {
              id: e.id,
              text: device!.name,
              data: device,
            };
          });

          // Hide devices that added to the group
          this.treeViewData.traverse((item) => {
            if (
              this.deviceListItems.some(
                (e) =>
                  `${DeviceTreeBuilder.DeviceIDPrefix}${e.data.id}` === item.id
              )
            ) {
              item.isVisible = false;
            }
          });

          this.devicesToAdd = [];
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  search(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this._searchTextSubject.next(text);
  }

  add() {
    if (this.devicesToAdd.length === 0) {
      return;
    }

    zip(
      from(this.devicesToAdd).pipe(
        map((item) =>
          this._groupManagementService
            .create({
              group_id: this.id,
              device_id: (item.data as Device).id,
            })
            .pipe(
              switchMap((response) => of({ response, item })),
              catchError(({ message }) =>
                of({
                  response: {
                    success: false,
                    message,
                    data: InvalidId,
                  },
                  item,
                })
              )
            )
        ),
        mergeAll()
      )
    ).subscribe((results) => {
      results
        .filter((e) => !e.response.success)
        .forEach((e) =>
          this._toastService.showError(
            `Add device ${e.item.data.name} to group failed with error: ${e.response.message}`
          )
        );

      const deviceIds = new Set<string>(
        results.filter((e) => e.response.success).map((e) => e.item.data.id.toString())
      );
      if (deviceIds.size === 0) {
        return;
      }

      this.deviceListItems.push(
        ...results
          .filter((e) => e.response.success)
          .map((e) => ({
            id: e.response.data,
            text: e.item.data.name,
            data: e.item.data,
          }))
      );

      // Hide devices that added to the group
      this.treeViewData.traverse((item) => {
        const id = item.id.split('-').slice(-1)[0];
        if (deviceIds.has(id)) {
          item.isVisible = false;
        }
      });

      this.devicesToAdd = [];
    });
  }

  remove() {
    if (this.devicesToRemove.length == 0) {
      return;
    }

    zip(
      from(this.devicesToRemove).pipe(
        map((item) =>
          this._groupManagementService.delete(item.id).pipe(
            switchMap((response) => of({ response, item })),
            catchError(({ message }) =>
              of({
                response: {
                  success: false,
                  message,
                },
                item,
              })
            )
          )
        ),
        mergeAll()
      )
    ).subscribe((results) => {
      console.log(results);
      results
        .filter((e) => !e.response.success)
        .forEach((e) =>
          this._toastService.showError(
            `Delete camera ${e.item.text} failed with error: ${e.response.message}`
          )
        );

      // Show devices that being removed from the group
      const deviceIds = new Set<string>(
        results.filter((e) => e.response.success).map((e) => e.item.data.id.toString())
      );
      if (deviceIds.size == 0) {
        return;
      }

      this.treeViewData.traverse((item) => {
        if (item.isLeaf) {
          const id = item.id.split('-').slice(-1)[0];
          if (deviceIds.has(id)) {
            item.isVisible = true;
          }
        }
      });

      this.deviceListItems = this.deviceListItems.filter(
        (e) => !deviceIds.has(e.data.id.toString())
      );

      this.devicesToRemove = [];
    });
  }

  cancel() {
    this._activeModal.dismiss();
  }

  submit() {
    this._activeModal.close();
  }
}
