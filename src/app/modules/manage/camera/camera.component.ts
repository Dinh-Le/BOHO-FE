import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';

import { v4 } from 'uuid';
import {
  CreateOrUpdateDeviceRequestDto,
  DeviceService,
} from 'src/app/data/service/device.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { ColumnConfig } from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  CameraDrivers,
  CameraDriver_RTSP,
  CameraType_Static,
  HoChiMinhCoord,
  DeviceType_Camera,
  DeviceStatus_Good,
} from 'src/app/data/constants';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { NodeService } from 'src/app/data/service/node.service';
import { of } from 'rxjs';
import { RowItemModel } from './row-item.model';
import { Device, Node } from 'src/app/data/schema/boho-v2';
import {
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss', '../shared/my-input.scss'],
})
export class CameraComponent implements OnInit, AfterViewInit {
  @ViewChild('statusColumnTemplate')
  statusColumnTemplate!: TemplateRef<any>;

  private _activatedRoute = inject(ActivatedRoute);
  private _nodeService = inject(NodeService);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _navigationService = inject(NavigationService);

  cameraDrivers: SelectItemModel[] = CameraDrivers.map((e) => ({
    value: e,
    label: e,
  }));
  nodeId: string = '';
  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [];
  milestoneServers: SelectItemModel[] = ['1', '2', '3'].map((e) => ({
    label: `Máy chủ ${e}`,
    value: `server-${e}`,
  }));
  milestoneCameras: SelectItemModel[] = ['1', '2', '3'].map((e) => ({
    label: `Camera ${e}`,
    value: `camera-${e}`,
  }));

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên camera',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Địa chỉ RTSP',
        prop: 'rtspUrl',
        sortable: true,
      },
      {
        label: 'Loại',
        prop: 'type',
        sortable: true,
      },
      {
        label: 'Nút',
        prop: 'nodeName',
      },
      {
        label: 'Trạng thái',
        prop: 'status',
        width: '200',
        contentTemplateRef: this.statusColumnTemplate,
      },
    ];
    this._changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this._activatedRoute.params
      .pipe(
        switchMap(({ nodeId }) => {
          this.nodeId = nodeId;
          return this._deviceService.findAll(this.nodeId);
        }),
        catchError(({ message }) => {
          return of({
            success: false,
            message,
            data: [],
          });
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this._toastService.showError(
              'Fetch device data failed with error: ' + response.message
            );
            return;
          }

          this.data = response.data.map((device) => {
            const row = new RowItemModel(device);
            row.status = DeviceStatus_Good;
            return row;
          });
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  trackById(_: number, item: any) {
    return item.id;
  }

  //#region Event handlers
  add() {
    const device: Device = {
      id: v4(),
      name: '',
      is_active: true,
      type: DeviceType_Camera,
      location: HoChiMinhCoord,
      camera: {
        type: CameraType_Static,
        driver: CameraDriver_RTSP,
        connection_metadata: {
          rtsp: {
            rtsp_url: '',
            user: '',
            password: '',
          },
        },
      },
    };
    const newItem = new RowItemModel(device);

    newItem.isNew = true;
    newItem.isEditable = true;
    newItem.isExpanded = true;

    this.data.push(newItem);
  }

  edit(item: RowItemModel) {
    item.isEditable = true;
  }

  save(item: RowItemModel) {
    const data: CreateOrUpdateDeviceRequestDto = {
      name: item.name,
      is_active: item.isActive,
      type: DeviceType_Camera,
      camera: {
        type: item.type,
        driver: item.driver,
        connection_metadata: {},
      },
    };

    if (item.isRtsp) {
      data.camera.connection_metadata.rtsp = {
        rtsp_url: item.rtspUrl,
        user: item.userId || '',
        password: item.password || '',
      };
    } else if (item.isOnvif) {
      const { camera } = item.form.value;
      const { ip, httpPort, userId, password, profile } = camera;
      data.camera.connection_metadata.onvif = {
        http_port: httpPort,
        ip: ip,
        password: password,
        user: userId,
        profile: profile.label,
        rtsp_port: 554,
      };
    } else {
      this._toastService.showWarning(
        'The Milestone driver is not supported yet'
      );
      return;
    }

    if (item.isNew) {
      this._deviceService
        .create(this.nodeId, data)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Create camera failed with error: ${response.message}`
              );
            }

            return of(response.data);
          })
        )
        .subscribe({
          next: ({ id, status }) => {
            item.status = status;
            this._toastService.showSuccess('Create camera successfully');
            item.id = id.toString();
            item.isNew = false;
            item.isEditable = false;
            this._navigationService.treeItemChange$.next({
              type: SideMenuItemType.DEVICE,
              action: 'create',
              data: Object.assign({}, data, {
                id,
                node_id: this.nodeId,
              }),
            });
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } else {
      this._deviceService
        .update(this.nodeId, item.id, data)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Update camera failed with error: ${response.message}`
              );
            }

            return of(response.data);
          })
        )
        .subscribe({
          next: ({ status }) => {
            item.status = status;
            this._toastService.showSuccess('Update camera successfully');
            item.isEditable = false;
            this._navigationService.treeItemChange$.next({
              type: SideMenuItemType.DEVICE,
              action: 'update',
              data: Object.assign({}, data),
            });
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    }
  }

  cancel(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    item.isEditable = false;
  }

  remove(item: RowItemModel) {
    this._deviceService
      .delete(this.nodeId, item.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error('Delete camera failed. Reason: ' + response.message);
          }

          return of(response);
        })
      )
      .subscribe({
        next: () => {
          this._toastService.showSuccess('Delete camera successfully');
          this.data = this.data.filter((e) => e.id !== item.id);
          this._navigationService.treeItemChange$.next({
            type: SideMenuItemType.DEVICE,
            action: 'delete',
            data: {
              id: item.id,
            },
          });
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  getOnvifProfiles(ev: Event, item: RowItemModel) {
    const button = ev.target as HTMLButtonElement;
    button.disabled = true;

    const { camera } = item.form.value;
    const { ip, httpPort, userId, password } = camera;

    this._deviceService
      .findAllOnvifProfiles(this.nodeId, {
        ip,
        port: httpPort,
        user: userId,
        password,
      })
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Connect to camera failed with error: ${response.message}`
            );
          }

          return of(response.data);
        }),
        finalize(() => (button.disabled = false))
      )
      .subscribe({
        next: (profiles) => {
          item.onvifProfiles = Object.entries(profiles).map(([k, v]) => ({
            value: v,
            label: k,
          }));
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  //#endregion
}
