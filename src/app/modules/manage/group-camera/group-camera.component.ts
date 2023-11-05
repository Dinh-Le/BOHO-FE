import { Component } from '@angular/core';
import { v4 } from 'uuid';

interface RowData {
  id: string;
  name: string;
  cameraCount: number;
  editable?: boolean;
}

@Component({
  selector: 'app-group-camera',
  templateUrl: 'group-camera.component.html',
  styleUrls: ['../shared/table.scss'],
})
export class GroupCameraComponent {
  data: RowData[] = [];

  add() {
    this.data.push({
      id: v4(),
      name: '',
      cameraCount: 0,
      editable: true,
    });
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  remove(item: RowData) {
    this.data = this.data.filter((e) => e.id !== item.id);
  }

  update(item: RowData) {
    item.editable = false;
  }

  showManageCameraDialog(item: RowData) {}
}
