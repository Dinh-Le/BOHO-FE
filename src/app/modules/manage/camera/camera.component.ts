import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  inject,
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
  InvalidId,
  DeviceType_Camera,
  DeviceStatus_Good,
} from 'src/app/data/constants';
import { catchError, switchMap } from 'rxjs/operators';
import { NodeService } from 'src/app/data/service/node.service';
import { of } from 'rxjs';
import { RowItemModel } from './row-item.model';
import { Device, Node } from 'src/app/data/schema/boho-v2';

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

  cameraDrivers: SelectItemModel[] = CameraDrivers.map((e) => ({
    value: e,
    label: e,
  }));
  node: Node | undefined;
  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
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
    },
  ];
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
  }

  ngOnInit(): void {
    this._activatedRoute.params
      .pipe(
        switchMap((params) => this._nodeService.find(params['nodeId'])),
        switchMap((response) => {
          if (!response.success) {
            throw new Error(response.message);
          }

          this.node = response.data;
          return this._deviceService.findAll(this.node.id);
        }),
        catchError(({ message }) => {
          return of({
            success: false,
            message,
            data: [],
          });
        })
      )
      .subscribe((response) => {
        if (!response.success) {
          this._toastService.showError(
            'Fetch device data failed with error: ' + response.message
          );
          return;
        }

        this.data = response.data.map((device) => {
          const row = new RowItemModel(device, this.node!);
          row.status = DeviceStatus_Good;
          return row;
        });
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
    const newItem = new RowItemModel(device, this.node!);

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

    if (item.driver === CameraDriver_RTSP) {
      data.camera.connection_metadata.rtsp = {
        rtsp_url: item.rtspUrl,
        user: item.userId || '',
        password: item.password || '',
      };
    }

    if (item.isNew) {
      this._deviceService
        .create(this.node!.id, data)
        .pipe(
          catchError(({ message }) =>
            of({
              success: false,
              message,
              data: InvalidId,
            })
          )
        )
        .subscribe((response) => {
          if (!response.success) {
            this._toastService.showError(
              'Create camera failed with error: ' + response.message
            );
            return;
          }

          item.id = response.data.toString();
          item.isNew = false;
          item.isEditable = false;
        });
    } else {
      this._deviceService
        .update(this.node!.id, item.id, data)
        .pipe(
          catchError(({ message }) =>
            of({
              success: false,
              message,
              data: InvalidId,
            })
          )
        )
        .subscribe((response) => {
          if (!response.success) {
            this._toastService.showError(
              'Update camera failed with error: ' + response.message
            );
            return;
          }

          item.isEditable = false;
        });
    }
  }

  remove(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    this._deviceService
      .delete(this.node!.id, item.id)
      .pipe(
        catchError(({ message }) =>
          of({
            success: false,
            message: message,
          })
        )
      )
      .subscribe((response) => {
        if (!response.success) {
          this._toastService.showError(
            'Delete camera failed. Reason: ' + response.message
          );
          return;
        }

        this.data = this.data.filter((e) => e.id !== item.id);
      });
  }

  //#endregion
}
