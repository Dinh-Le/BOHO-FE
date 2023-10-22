import { Component, OnInit } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { CameraItem, cameraListMockData } from './camera-item';
import { MenuItem } from '../menu-item';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
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
