import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { PresetService } from 'src/app/data/service/preset.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, catchError, of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { DeviceService } from 'src/app/data/service/device.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponseBase } from 'src/app/data/schema/boho-v2/response-base';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
  styleUrls: ['preset-settings.component.scss', '../../shared/my-input.scss'],
})
export class PresetSettingsComponent implements OnInit, OnDestroy {
  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  presetList: EditableListViewItemModel[] = [];
  selectedItem: EditableListViewItemModel | undefined;
  nodeId = '';
  cameraId = '';
  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.PRESET_SETTINGS;
    const activatedRouteSubscription = this._activatedRoute
      .parent!.params.pipe(
        switchMap(({ nodeId, cameraId }) => {
          this.nodeId = nodeId;
          this.cameraId = cameraId;
          return this._presetService.findAll(nodeId, cameraId);
        })
      )
      .subscribe({
        next: (response) => {
          this.presetList = response.data.map((e) => ({
            id: e.id.toString(),
            label: e.name,
          }));
        },
        error: ({ message }) => this._toastService.showError(message),
      });
    this._subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  load() {
    this._presetService
      .sync(this.nodeId, this.cameraId)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Load preset failed with error: ${response.message}`);
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (presets) => {
          this.presetList = presets.map((e) => ({
            id: e.id.toString(),
            label: e.name,
          }));
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  play(img: HTMLImageElement) {
    if (!this.selectedItem) {
      return;
    }

    const presetId = parseInt(this.selectedItem.id);
    this._presetService
      .control(this.nodeId, this.cameraId, presetId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status > 0) {
            return of(err.error);
          }

          throw Error(err.message);
        })
      )
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            // throw Error(
            //   `Move PTZ at direct preset failed with error ${response.message}`
            // );
            this._toastService.showError(
              `Move PTZ at direct preset failed with error ${response.message}`
            );
          }

          return this._deviceService.snapshot(this.nodeId, this.cameraId);
        }),
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Get snapshot from camera failed with error ${response.message}`
            );
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (snapshot) => {
          img.src = `data:image/${snapshot.format};charset=utf-8;base64,${snapshot.img}`;
          img.style.aspectRatio = (
            snapshot.size[0] / snapshot.size[1]
          ).toString();
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  remove(item: EditableListViewItemModel) {
    this._presetService
      .delete(this.nodeId, this.cameraId, parseInt(item.id))
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Delete preset failed with error: ${response.message}`);
          }

          return of(response);
        })
      )
      .subscribe({
        next: () => {
          this._toastService.showSuccess('Delete preset successfully');
          this.presetList = this.presetList.filter((e) => e.id !== item.id);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  save(item: EditableListViewItemModel) {
    this._presetService
      .update(this.nodeId, this.cameraId, parseInt(item.id), {
        name: item.label,
      })
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Update preset failed with error: ${response.message}`);
          }

          return of(response);
        })
      )
      .subscribe({
        next: () =>
          this._toastService.showSuccess('Update preset successfully'),
        error: ({ message }) => this._toastService.showError(message),
      });
  }
}
