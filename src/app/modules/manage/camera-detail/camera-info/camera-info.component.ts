import { Component, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocationPickerComponent } from '../location-picker/location-picker.component';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/data/service/device.service';
import { ToastService } from '@app/services/toast.service';

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
  styleUrls: ['camera-info.component.scss'],
})
export class CameraInfoComponent implements OnInit {
  modalService = inject(NgbModal);
  id: string;
  data: CameraInfo = {
    name: '',
    address: '',
    driverName: '',
    typeName: '',
    rtspUrl: '',
  };

  constructor(
    activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private toastService: ToastService,
  ) {
    this.id = activatedRoute.parent?.snapshot.params['cameraId'];
  }

  ngOnInit(): void {
    this.deviceService.find('0', '0', this.id).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Fetch camera data failed.');
        return;
      }

      this.data = {
        name: response.data.name,
        address: response.data.device_metadata.describle,
        driverName: response.data.camera.driver,
        typeName: response.data.camera.type,
        rtspUrl: response.data.camera.connection_metadata.rtsp?.rtsp_url || ''
      }
    });
  }
 
  changeAddress() {
    this.modalService
      .open(LocationPickerComponent, {
        size: 'lg',
      })
      .result.then((value) => {
        console.log(value);
      });
  }
}
