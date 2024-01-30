import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  inject,
  ChangeDetectorRef,
  OnDestroy,
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
  DeviceStatus_Disconnected,
} from 'src/app/data/constants';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { RowItemModel } from './row-item.model';
import { Device } from 'src/app/data/schema/boho-v2';
import {
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss', '../shared/my-input.scss'],
})
export class CameraComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('statusColumnTemplate')
  statusColumnTemplate!: TemplateRef<any>;

  private _activatedRoute = inject(ActivatedRoute);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _navigationService = inject(NavigationService);
  private _subscription: Subscription[] = [];

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
    const activatedRouteSubscription = this._activatedRoute.params
      .pipe(
        switchMap(({ nodeId }) => {
          this.nodeId = nodeId;
          return this._deviceService.findAll(this.nodeId);
        })
      )
      .subscribe({
        next: ({ data: devices }) => {
          this.data = devices.map((device) => {
            const row = new RowItemModel(device);
            row.status = device.status ?? DeviceStatus_Disconnected;
            return row;
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    this._subscription.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this._subscription.forEach((e) => e.unsubscribe());
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
        rtsp_port: parseInt(profile.value.match(/:(\d+)\//)[1]),
        rtsp_url: profile.value,
      };
    } else {
      this._toastService.showWarning(
        'The Milestone driver is not supported yet'
      );
      return;
    }

    if (item.isNew) {
      this._deviceService.create(this.nodeId, data).subscribe({
        next: ({ data: { id, status } }) => {
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
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    } else {
      this._deviceService.update(this.nodeId, item.id, data).subscribe({
        next: ({ data: { status } }) => {
          item.status = status;
          this._toastService.showSuccess('Update camera successfully');
          item.isEditable = false;
          this._navigationService.treeItemChange$.next({
            type: SideMenuItemType.DEVICE,
            action: 'update',
            data: Object.assign({}, data),
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    }
  }

  cancel(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    this._deviceService.find(this.nodeId, item.id).subscribe({
      next: ({ data }) => {
        item.update(data);
        item.isEditable = false;
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });
  }

  remove(item: RowItemModel) {
    this._deviceService.delete(this.nodeId, item.id).subscribe({
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
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
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
      .subscribe({
        next: ({ data: profiles }) => {
          item.onvifProfiles = Object.entries(profiles).map(([k, v]) => ({
            value: v,
            label: k,
          }));
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
        complete: () => (button.disabled = false),
      });
  }

  takeSnapshot(item: RowItemModel, img: HTMLImageElement) {
    this._deviceService.snapshot(this.nodeId, item.id).subscribe({
      next: ({ data: snapshot }) => {
        img.src = `data:image/${snapshot.format};charset=utf-8;base64,${snapshot.img}`;
        img.style.aspectRatio = (
          snapshot.size[0] / snapshot.size[1]
        ).toString();
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });
  }

  //#endregion
}
