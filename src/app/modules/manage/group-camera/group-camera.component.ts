import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from 'src/app/data/service/group.service';
import { AddGroupCameraComponent } from './add-group-camera/add-group-camera.component';
import { ManageCameraComponent } from './manage-camera/manage-camera.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription, of, switchMap } from 'rxjs';

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
export class GroupCameraComponent implements OnInit, OnDestroy {
  private _activatedRoute = inject(ActivatedRoute);
  private _groupService = inject(GroupService);
  private _toastService = inject(ToastService);
  private _modalService = inject(NgbModal);

  data: RowData[] = [];
  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const activatedRouteSubscription = this._activatedRoute.params
      .pipe(
        switchMap(({ userId }) => {
          this.initialize(userId);
          return this._userId !== ''
            ? this._groupService.findAll().pipe(
                switchMap(
                  ({ data: groups }) =>
                    (this.data = groups.map(({ id, name, camera_count }) => ({
                      id,
                      name,
                      cameraCount: camera_count ?? 0,
                    })))
                )
              )
            : of(true);
        })
      )
      .subscribe({
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    this._subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
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

  private _userId: string = '';
  private initialize(userId: string) {
    this._userId = userId ?? '';
    this.data = [];
  }
}
