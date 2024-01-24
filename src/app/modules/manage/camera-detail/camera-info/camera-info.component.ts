import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/data/service/device.service';
import { ToastService } from '@app/services/toast.service';
import { LocationPickerComponent } from './location-picker/location-picker.component';
import { Device } from 'src/app/data/schema/boho-v2/device';
import { LatLng } from 'src/app/data/schema/boho-v2/latlng';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { CameraDriver_Onvif, CameraDriver_RTSP } from 'src/app/data/constants';
import { Subscription } from 'rxjs';

interface CameraInfo {
  name: string;
  address: string;
  driverName: string;
  typeName: string;
  rtspUrl: string;
}

@Component({
  selector: 'app-camera-info',
  templateUrl: 'camera-info.component.html',
  styleUrls: ['camera-info.component.scss', '../../shared/my-input.scss'],
})
export class CameraInfoComponent implements OnInit, OnDestroy {
  modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  device: Device | undefined;
  data: CameraInfo = {
    name: '',
    address: '',
    driverName: '',
    typeName: '',
    rtspUrl: '',
  };
  private _activatedRouteSubscription: Subscription | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.DEVICE_INFO;
    this._activatedRouteSubscription =
      this.activatedRoute.parent?.params.subscribe((params) => {
        const { nodeId, cameraId } = params;

        this.deviceService.find(nodeId, cameraId).subscribe((response) => {
          if (!response.success) {
            this.toastService.showError('Fetch camera data failed.');
            return;
          }

          this.device = response.data;
          let rtspUrl = '';
          switch (response.data.camera.driver) {
            case CameraDriver_RTSP:
              rtspUrl =
                response.data.camera.connection_metadata.rtsp?.rtsp_url || '';
              break;
            case CameraDriver_Onvif:
              rtspUrl =
                response.data.camera.connection_metadata.onvif?.rtsp_url || '';
              break;
            default:
              break;
          }
          this.data = {
            name: response.data.name,
            address: this.geodecode(response.data.location),
            driverName: response.data.camera.driver,
            typeName: response.data.camera.type,
            rtspUrl,
          };
        });
      });
  }

  ngOnDestroy(): void {
    this._activatedRouteSubscription?.unsubscribe();
  }

  async changeAddress() {
    const modal = this.modalService.open(LocationPickerComponent, {
      size: 'xl',
      centered: true,
    });
    modal.componentInstance.latLng = {
      lat: this.device!.location.lat,
      lng: this.device!.location.long,
    };

    try {
      const { lat, lng } = await modal.result;
      this.device!.location = {
        lat,
        long: lng,
      };
      this.data.address = this.geodecode(this.device?.location);
      this.deviceService
        .update(this.device!.node_id!, this.device!.id, this.device!)
        .subscribe((response) => {
          if (!response.success) {
            this.toastService.showError('Change address failed.');
            return;
          }
        });
    } catch {
      // No action required.
    }
  }

  geodecode(latlng: LatLng | undefined) {
    if (latlng) {
      return `Toa do: ${latlng.lat}, ${latlng.long}`;
    } else {
      return '';
    }
  }
}
