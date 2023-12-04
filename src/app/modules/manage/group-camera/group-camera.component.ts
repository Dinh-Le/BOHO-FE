import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Group } from 'src/app/data/schema/boho-v2/group';
import { GroupService } from 'src/app/data/service/group.service';
import { v4 } from 'uuid';
import { AddGroupCameraComponent } from './add-group-camera/add-group-camera.component';
import { ManageCameraComponent } from './manage-camera/manage-camera.component';
import { catchError, of } from 'rxjs';
import { InvalidId } from 'src/app/data/constants';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';

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
    this._groupService
      .findAll()
      .pipe(
        catchError(({ message }) =>
          of({
            message,
            success: false,
            data: [],
          })
        )
      )
      .subscribe((response) => {
        if (!response.success) {
          this._toastService.showError(
            'Fetch group device failed. Reason: ' + response.message
          );
          return;
        }
        this.data = response.data.map(({ id, name }) => ({
          id,
          name,
          cameraCount: 0,
        }));
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

      this._groupService
        .create({ name, describle: '' })
        .pipe(
          catchError(({ message }) =>
            of({
              message,
              success: false,
              data: InvalidId,
            })
          )
        )
        .subscribe((response) => {
          if (!response.success) {
            this._toastService.showError(
              'Create group failed. Reason: ' + response.message
            );
            return;
          }

          this.data.push({
            id: response.data,
            name,
            cameraCount: 0,
            isEditable: false,
          });
        });
    } catch {
      // No action required.
    }
  }

  remove(item: RowData) {
    this._groupService.delete(item.id).subscribe((response) => {
      if (!response.success) {
        this._toastService.showError('Delete group failed');
        return;
      }

      this.data = this.data.filter((e) => e.id !== item.id);
    });
  }

  update(item: RowData) {
    this._groupService
      .update(item.id, {
        name: item.name,
        describle: '',
      })
      .pipe(
        catchError(({ message }) =>
          of({
            message,
            success: false,
            data: InvalidId,
          })
        )
      )
      .subscribe((response) => {
        if (!response.success) {
          this._toastService.showError(
            'Update group failed. Reason: ' + response.message
          );
          return;
        }

        item.isEditable = false;
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
