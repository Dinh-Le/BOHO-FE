import { Component, OnInit, inject } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { CameraItem, cameraListMockData } from './camera-item';
import { MenuItem } from '../menu-item';
import { v4 as uuid } from 'uuid';
import { DeviceService } from 'src/app/data/service/device.service';
import { NodeService } from 'src/app/data/service/node.service';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  deviceService = inject(DeviceService);
  nodeService = inject(NodeService);
  nodeOperatorService = inject(NodeOperatorService);

  cameraMenuItems: MenuItem[] = [
    {
      icon: 'bi-plus',
      title: 'Thêm',
      onclick: this.add.bind(this),
    },
  ];
  cameraList: CameraItem[] = [];
  cameraList$: Observable<CameraItem[]> | undefined;

  ngOnInit(): void {
    timer(1000).subscribe(() => {
      this.cameraList = cameraListMockData.map((e) => ({ ...e }));
    });
    this.nodeOperatorService
      .findAll('b430f545-97c1-44e6-9269-1dd3c7b7315b')
      .subscribe(response => {
        console.log(response);
      })
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
    };
    this.cameraList.push(newCamera);
  }

  edit(item: CameraItem) {
    item.isEditMode = true;
  }

  save(item: CameraItem) {
    item.isEditMode = false;
  }

  reset(item: CameraItem) {}

  remove(item: CameraItem) {
    this.cameraList = this.cameraList.filter((e) => e.id !== item.id);
  }
}
