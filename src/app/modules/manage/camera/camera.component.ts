import { Component, OnInit } from '@angular/core';
import { CameraItem } from './camera-item';
import { v4 as uuid } from 'uuid';
import { DeviceService } from 'src/app/data/service/device.service';
import { ActivatedRoute } from '@angular/router';
import { ConnectionMetadata, Device } from 'src/app/data/schema/boho-v2/device';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  nodeId: string;
  cameraList: CameraItem[] = [];

  constructor(
    activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private toastService: ToastService
  ) {
    this.nodeId = activatedRoute.snapshot.params['nodeId'];
  }

  ngOnInit(): void {
    this.deviceService.findAll('0', this.nodeId).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Fetch camera data failed');
        return;
      }

      this.cameraList = response.data.map((e) => {
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

        return {
          id: e.id,
          name: e.name,
          type: e.type,
          node: '',
          status: '',
          rtspUrl,
        };
      });
    });
  }

  trackById(_: number, item: any) {
    return item.id;
  }

  add() {
    const newCamera: CameraItem = {
      id: uuid(),
      name: '',
      rtspUrl: '',
      type: 'Cố định',
      node: '',
      status: '',
      driverType: 'rtsp',
      isExpanded: true,
      isEditMode: true,
      isNew: true,
    };
    this.cameraList.push(newCamera);
  }

  edit(item: CameraItem) {
    item.isEditMode = true;
  }

  save(item: CameraItem) {
    const connectionMetadata: ConnectionMetadata = {};
    if (item.driverType === 'rtsp') {
      connectionMetadata.rtsp = {
        rtsp_url: item.rtspUrl,
        user: item.rtspUsername || '',
        password: item.rtspPassword || '',
      };
    } else if (item.driverType === 'onvif') {
      connectionMetadata.onvif = {
        ip: item.onvifIp || '',
        http_port: item.onvifPort || '',
        rtsp_port: item.rtspUrl || '',
        profile: item.onvifProfile || '',
        user: item.onvifUsername || '',
        password: item.onvifPassword || '',
      };
    } else if (item.driverType === 'milestone') {
      connectionMetadata.milestone = {
        ip: item.milestoneIp || '',
        http_port: item.milestonePort || '',
        rtsp_port: item.milestoneRtspUrl || '',
        authen_type: item.milestoneAuthType || '',
        profile: '' || '',
        user: item.milestoneUsername || '',
        password: item.milestonePassword || '',
      };
    }
    const device: Device = {
      id: item.id,
      name: item.name,
      device_metadata: {
        manufacture: '',
        describle: '',
      },
      location: {
        lat: '',
        long: '',
      },
      type: item.type || '',
      camera: {
        driver: item.driverType || '',
        type: item.type || '',
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
      item.driverType = device.camera.driver;
      item.isEditMode = false;
      item.isNew = false;
    });
  }

  reset(item: CameraItem) {}

  remove(item: CameraItem) {
    if (item.isNew) {
      this.cameraList = this.cameraList.filter((e) => e.id !== item.id);
    } else {
      this.deviceService
        .delete('0', this.nodeId, item.id)
        .subscribe((response) => {
          if (!response.success) {
            this.toastService.showError('Delete camera failed');
            return;
          }

          this.cameraList = this.cameraList.filter((e) => e.id !== item.id);
        });
    }
  }
}
