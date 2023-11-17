import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Group } from 'src/app/data/schema/boho-v2/group';
import { GroupService } from 'src/app/data/service/group.service';
import { v4 } from 'uuid';
import { AddGroupCameraComponent } from './add-group-camera/add-group-camera.component';

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
export class GroupCameraComponent implements OnInit {
  groupService = inject(GroupService);
  toastService = inject(ToastService);
  modalService = inject(NgbModal);
  data: RowData[] = [];

  ngOnInit(): void {
    this.groupService.findAll('0').subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Fetch group device failed');
        return;
      }
      this.data = response.data.map((e) => ({
        id: e.id,
        name: e.name,
        cameraCount: 0,
      }));
    });
  }

  async add() {
    try {
      const { name } = await this.modalService.open(AddGroupCameraComponent)
        .result;

      const newGroup: Group = {
        id: v4(),
        name: name,
        describle: '',
      };

      this.groupService
        .create('0', newGroup)
        .subscribe((response) => {
          if (!response.success) {
            this.toastService.showError('Create group failed');
            return;
          }

          this.data.push({
            id: newGroup.id,
            name: newGroup.name,
            cameraCount: 0,
            editable: false,
          });
        });
    } catch {
      // No action required.
    }
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  remove(item: RowData) {
    this.groupService.delete('0', item.id).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Delete group failed');
        return;
      }

      this.data = this.data.filter((e) => e.id !== item.id);
    });
  }

  update(item: RowData) {
    const group: Group = {
      id: item.id,
      name: item.name,
      describle: '',
    };
    this.groupService.update('0', group).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Update group failed');
        return;
      }

      item.editable = false;
    });
  }

  showManageCameraDialog(item: RowData) {}
}
