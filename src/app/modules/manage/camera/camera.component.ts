import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import { v4 as uuid } from 'uuid';
import { DeviceService } from 'src/app/data/service/device.service';
import { ActivatedRoute } from '@angular/router';
import { ConnectionMetadata, Device } from 'src/app/data/schema/boho-v2/device';
import { ToastService } from '@app/services/toast.service';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';

interface RowData extends ExpandableTableRowData {
  id: string;
  name: string;
  rtspUrl: string;
  type: string;
  node: string;
  status: string;
  form?: FormGroup<any>;
  isEditMode?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit, AfterViewInit {
  @ViewChild('statusColumnTemplate')
  statusColumnTemplate!: TemplateRef<any>;

  nodeId: string;
  data: RowData[] = [];
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
    },
  ];
  cameraDrivers: SelectItemModel[] = [
    {
      value: 'rtsp',
      label: 'RTSP',
    },
    {
      value: 'onvif',
      label: 'ONVIF',
    },
    {
      value: 'milestone',
      label: 'Milestone',
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

  constructor(
    activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private toastService: ToastService
  ) {
    this.nodeId = activatedRoute.snapshot.params['nodeId'];
  }

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
        contentTemplateRef: this.statusColumnTemplate,
      },
    ];
  }

  ngOnInit(): void {
    this.deviceService.findAll('0', this.nodeId).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Fetch camera data failed');
        return;
      }

      this.data = response.data.map((e) => {
        let rtspUrl = '';

        if (e.camera.connection_metadata.rtsp) {
          rtspUrl = e.camera.connection_metadata.rtsp.rtsp_url;
        } else if (e.camera.connection_metadata.onvif) {
          const { ip, rtsp_port } = e.camera.connection_metadata.onvif;
          rtspUrl = `${ip}:${rtsp_port}`;
        } else if (e.camera.connection_metadata.milestone) {
          const { ip, rtsp_port } = e.camera.connection_metadata.milestone;
          rtspUrl = `${ip}:${rtsp_port}`;
        }

        const rowData = {
          id: e.id,
          name: e.name,
          type: e.type,
          node: '',
          status: '',
          rtspUrl,
          form: new FormGroup({
            name: new FormControl(e.name, [Validators.required]),
            activation: new FormControl(false, [Validators.required]),
            driver: new FormControl(
              this.cameraDrivers.find((d) => d.value === e.camera.driver),
              [Validators.required]
            ),
            type: new FormControl(e.type, [Validators.required]),            
          }),
        };
        this.setSubForm(rowData, e);
        return rowData;
      });
    });
  }

  trackById(_: number, item: any) {
    return item.id;
  }

  canSubmit() {}

  setSubForm(item: RowData, device?: Device) {
    const driver = item.form?.get('driver')?.value?.value;
    if (driver === 'rtsp') {
      item.form!.removeControl('subForm');
      item.form!.addControl(
        'subForm',
        new FormGroup({
          url: new FormControl(device?.camera.connection_metadata.rtsp?.rtsp_url, [Validators.required]),
          userId: new FormControl(device?.camera.connection_metadata.rtsp?.user, [Validators.required]),
          password: new FormControl(device?.camera.connection_metadata.rtsp?.password, [Validators.required]),
        })
      );
    } else if (driver === 'onvif') {
      item.form!.removeControl('subForm');
      item.form!.addControl(
        'subForm',
        new FormGroup({
          ip: new FormControl(device?.camera.connection_metadata.onvif?.ip, [Validators.required]),
          port: new FormControl(device?.camera.connection_metadata.onvif?.http_port, [Validators.required]),
          userId: new FormControl(device?.camera.connection_metadata.onvif?.user, [Validators.required]),
          password: new FormControl(device?.camera.connection_metadata.onvif?.password, [Validators.required]),
          profile: new FormControl(device?.camera.connection_metadata.onvif?.profile, [Validators.required]),
          rtspUrl: new FormControl(device?.camera.connection_metadata.onvif?.rtsp_port, [Validators.required]),
        })
      );
    } else if (driver === 'milestone') {
      item.form!.removeControl('subForm');
      item.form!.addControl(
        'subForm',
        new FormGroup({
          server: new FormControl(null, [Validators.required]),
          camera: new FormControl(null, [Validators.required]),
          rtspUrl: new FormControl(null, [Validators.required]),
        })
      );
    }
  }

  add() {
    const newCamera: RowData = {
      id: uuid(),
      name: '',
      rtspUrl: '',
      type: '',
      node: '',
      status: '',
      form: new FormGroup({
        name: new FormControl(null, [Validators.required]),
        activation: new FormControl(false, [Validators.required]),
        driver: new FormControl(this.cameraDrivers[0], [Validators.required]),
        type: new FormControl(null, [Validators.required]),
      }),
      isExpanded: true,
      isEditMode: true,
      isNew: true,
    };
    this.data.push(newCamera);
  }

  edit(item: RowData) {
    item.isEditMode = true;
  }

  save(item: RowData) {
    const driver = item.form?.get('driver')?.value?.value;
    const connectionMetadata: ConnectionMetadata = {};
    if (driver === 'rtsp') {
      const { url, userId, password } = item.form?.get('subForm')?.value;
      connectionMetadata.rtsp = {
        rtsp_url: url,
        user: userId,
        password: password,
      };
    } else if (driver === 'onvif') {
      const { ip, port, userId, password, profile, rtspUrl } =
        item.form?.get('subForm')?.value;
      connectionMetadata.onvif = {
        ip,
        http_port: port,
        rtsp_port: rtspUrl,
        profile: profile,
        user: userId,
        password: password,
      };
    } else if (driver === 'milestone') {
      const { server, camera, rtspUrl } = item.form?.get('subForm')?.value;
      connectionMetadata.milestone = {
        ip: '',
        http_port: '',
        rtsp_port: rtspUrl,
        authen_type: '',
        profile: '' || '',
        user: '',
        password: '',
      };
    }

    const device: Device = {
      id: item.id,
      name: item.form?.get('name')?.value,
      device_metadata: {
        manufacture: '',
        describle: '',
      },
      location: {
        lat: '',
        long: '',
      },
      type: item.form?.get('type')?.value,
      camera: {
        driver: item.form?.get('driver')?.value.value,
        type: item.form?.get('type')?.value,
        connection_metadata: connectionMetadata,
      },
    };

    const response$ = item.isNew
      ? this.deviceService.create('0', this.nodeId, device)
      : this.deviceService.update('0', this.nodeId, device);
    response$.subscribe((response) => {
      if (!response.success) {
        const message = item.isNew
          ? 'Add camera failed'
          : 'Update camera failed';
        this.toastService.showError(message);
        return;
      }

      item.name = device.name;
      item.type = device.type;
      item.rtspUrl = connectionMetadata.rtsp?.rtsp_url || '';
      item.isEditMode = false;
      item.isNew = false;
    });
  }

  reset(item: RowData) {}

  remove(item: RowData) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
    } else {
      this.deviceService
        .delete('0', this.nodeId, item.id)
        .subscribe((response) => {
          if (!response.success) {
            this.toastService.showError('Delete camera failed');
            return;
          }

          this.data = this.data.filter((e) => e.id !== item.id);
        });
    }
  }
}
