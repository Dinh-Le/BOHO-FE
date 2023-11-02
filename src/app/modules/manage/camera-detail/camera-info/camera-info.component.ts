import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocationPickerComponent } from '../location-picker/location-picker.component';

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
export class CameraInfoComponent {
  modalService = inject(NgbModal);

  data: CameraInfo = {
    name: '22 Đường Số 23 Linh Chiểu',
    address: '22 Đường Số 23, Linh Chiểu, Thủ Đức, Hồ Chí Minh City',
    driverName: 'RTSP',
    typeName: 'Cố định',
    rtspUrl: 'rtsp://192.168.1.1/cam0_0',
  };

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
