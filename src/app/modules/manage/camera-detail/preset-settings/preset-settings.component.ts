import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { PresetService } from 'src/app/data/service/preset.service';
import { ActivatedRoute } from '@angular/router';
import {
  Subscription,
  catchError,
  filter,
  finalize,
  of,
  pipe,
  switchMap,
} from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { DeviceService } from 'src/app/data/service/device.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
  styleUrls: ['preset-settings.component.scss', '../../shared/my-input.scss'],
  host: {
    class: 'flex-grow-1 d-flex flex-column my-bg-default px-5 pb-5 pt-1',
  },
})
export class PresetSettingsComponent implements OnInit, OnDestroy {
  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  presetList: EditableListViewItemModel[] = [];
  selectedItem?: EditableListViewItemModel;
  nodeId = '';
  deviceId = '';
  loading: boolean = true;
  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.PRESET_SETTINGS;
    const activatedRouteSubscription = this._activatedRoute
      .parent!.params.pipe(filter(({ nodeId, cameraId }) => nodeId && cameraId))
      .subscribe({
        next: ({ nodeId, cameraId: deviceId }) => {
          this.nodeId = nodeId;
          this.deviceId = deviceId;
          this.presetList = [];

          this.loading = true;
          this._presetService
            .findAll(this.nodeId, this.deviceId)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
              next: ({ data: presets }) => {
                this.presetList = presets.map((e) => ({
                  id: e.id.toString(),
                  label: e.name,
                }));
              },
              error: (err: HttpErrorResponse) =>
                this._toastService.showError(
                  `Fetch data failed with error: ${
                    err.error?.message ?? err.message
                  }`
                ),
            });
        },
        error: ({ message }) => this._toastService.showError(message),
      });
    this._subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  trackById(_: any, { id }: any) {
    return id;
  }

  load() {
    this.loading = true;
    this._presetService
      .sync(this.nodeId, this.deviceId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ data: presets }) => {
          this.presetList = presets.map((e) => ({
            id: e.id.toString(),
            label: e.name,
          }));
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Load preset failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }

  play(img: HTMLImageElement) {
    if (!this.selectedItem) {
      return;
    }

    const presetId = parseInt(this.selectedItem.id);
    this._presetService
      .control(this.nodeId, this.deviceId, presetId)
      .pipe(
        switchMap(() =>
          this._deviceService.snapshot(this.nodeId, this.deviceId)
        )
      )
      .subscribe({
        next: ({ data: snapshot }) => {
          img.src = `data:image/${snapshot.format};charset=utf-8;base64,${snapshot.img}`;
          img.style.aspectRatio = (
            snapshot.size[0] / snapshot.size[1]
          ).toString();
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  select(item: EditableListViewItemModel) {
    if (this.selectedItem?.id === item.id) {
      return;
    }

    if (this.selectedItem?.isEditable) {
      this.save(item);
      this.selectedItem.isEditable = false;
    }

    this.selectedItem = item;
  }

  remove(item: EditableListViewItemModel) {
    this.loading = true;
    this._presetService
      .delete(this.nodeId, this.deviceId, parseInt(item.id))
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        complete: () => {
          this._toastService.showSuccess('Delete preset successfully');
          this.presetList = this.presetList.filter((e) => e.id !== item.id);
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Delete preset failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }

  save({ id, label: name }: EditableListViewItemModel) {
    this.loading = true;
    this._presetService
      .update(this.nodeId, this.deviceId, parseInt(id), {
        name,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        complete: () => {
          this._toastService.showSuccess('Update preset successfully');
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }
}
