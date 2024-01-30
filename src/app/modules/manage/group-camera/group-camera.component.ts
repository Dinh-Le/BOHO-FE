import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from 'src/app/data/service/group.service';
import { AddGroupCameraComponent } from './add-group-camera/add-group-camera.component';
import { ManageCameraComponent } from './manage-camera/manage-camera.component';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';
import { HttpErrorResponse } from '@angular/common/http';

interface RowData {
  id: string;
  name: string;
  cameraCount: number;
  isEditable?: boolean;
}

@Component({
  selector: 'app-group-camera',
  templateUrl: 'group-camera.component.html',
  styleUrls: ['../shared/table.scss'],
})
export class GroupCameraComponent implements OnInit {
  private _groupService = inject(GroupService);
  private _toastService = inject(ToastService);
  private _modalService = inject(NgbModal);

  data: RowData[] = [];
  viewMode = ViewMode.Geolocation;

  ngOnInit(): void {
    this._groupService.findAll().subscribe({
      next: ({ data: groups }) =>
        (this.data = groups.map(({ id, name, camera_count }) => ({
          id,
          name,
          cameraCount: camera_count ?? 0,
        }))),
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  //#region  Event handlers
  async add() {
    try {
      const { name } = await this._modalService.open(AddGroupCameraComponent)
        .result;

      this._groupService.create({ name, describle: '' }).subscribe({
        next: ({ data: id }) => {
          this._toastService.showSuccess('Create group successfully');
          this.data.push({
            id,
            name,
            cameraCount: 0,
            isEditable: false,
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    } catch {
      // No action required.
    }
  }

  remove(item: RowData) {
    this._groupService.delete(item.id).subscribe({
      complete: () => {
        this._toastService.showSuccess('Delete group successfully');
        this.data = this.data.filter((e) => e.id !== item.id);
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });
  }

  update(item: RowData) {
    this._groupService
      .update(item.id, {
        name: item.name,
        describle: '',
      })
      .subscribe({
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
        complete: () => {
          this._toastService.showSuccess('Update group successfully');
          item.isEditable = false;
        },
      });
  }

  showManageCameraDialog(item: RowData) {
    const modal = this._modalService.open(ManageCameraComponent, {
      size: 'xl',
    });
    modal.componentInstance.id = item.id;
    modal.componentInstance.name = item.name;
  }

  //#endregion
}
