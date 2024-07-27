import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  EMPTY,
  Observable,
  Subscription,
  catchError,
  concat,
  forkJoin,
  map,
  of,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import {
  AutoTrackOptions,
  Device,
  Handover,
  ZoomAndCentralizeOptions,
} from 'src/app/data/schema/boho-v2';
import { AutoTrackingOptions, ZoomAndFocusOptions } from '../models';
import {
  CreateOrUpdateHandoverRequest,
  HandoverService,
} from 'src/app/data/service/handover.service';
import { InvalidId } from 'src/app/data/constants';
import { Nullable } from '@shared/shared.types';
import { RowItemModel } from './models';

@Component({
  selector: 'app-handover-settings',
  templateUrl: 'handover-settings.component.html',
  styleUrls: ['handover-settings.component.scss'],
})
export class HandoverSettingsComponent implements OnInit, OnDestroy {
  @HostBinding('class') classNames =
    'flex-grow-1 d-flex flex-column my-bg-default';

  readonly postActionItemsSource: SelectItemModel[] = [
    {
      label: 'Không',
      value: 'none',
    },
    {
      label: 'Căn giữa & phóng to',
      value: 'zoom_and_centralize',
    },
    {
      label: 'Tự động theo dõi',
      value: 'auto_track',
    },
  ];

  private _subscriptions: Subscription[] = [];
  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  private _handoverService = inject(HandoverService);
  private _nodeId: string = '';
  private _deviceId: number = +InvalidId;

  editingRowItem: Nullable<RowItemModel>;
  postActionOptions: Nullable<
    (ZoomAndFocusOptions | AutoTrackingOptions) & {
      nodeId: string;
      deviceId: number;
      presetId: number;
    }
  >;
  tableItemsSource: RowItemModel[] = [];
  devices: Device[] = [];
  handovers: Handover[] = [];

  constructor() {
    this._navigationService.level3 = Level3Menu.CHUYEN_PTZ;
    this._activatedRoute.parent?.params
      .pipe(
        tap(({ nodeId, cameraId }) => {
          this._nodeId = nodeId;
          this._deviceId = +cameraId;
          this.resetState();
        }),
        switchMap(() =>
          forkJoin([
            this._deviceService.findAll(this._nodeId).pipe(
              map((response) =>
                response.data.filter(
                  (device) => device.camera.type.toLowerCase() !== 'static'
                )
              ),
              catchError(
                this.handleHttpErrorAndReturnEmptyArray.bind(
                  this,
                  'Error fetching camera list'
                )
              )
            ),
            this._handoverService.findAll(this._nodeId, this._deviceId).pipe(
              map((response) => response.data),
              catchError(
                this.handleHttpErrorAndReturnEmptyArray.bind(
                  this,
                  'Error fetching handover list'
                )
              )
            ),
          ])
        )
      )
      .subscribe(([devices, handovers]) => {
        this.devices = devices;
        this.handovers = handovers;
      });
  }

  private handleHttpErrorAndReturnEmptyArray(
    errorMessage: string,
    error: HttpErrorResponse
  ): Observable<any[]> {
    const message = error.error?.message ?? error.message;
    this._toastService.showError(errorMessage + ': ' + message);
    return of([]);
  }

  private resetState(): void {
    this.tableItemsSource = [];
    this.editingRowItem = undefined;
    this.postActionOptions = null;
    this.devices = [];
    this.handovers = [];
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  private initialize(): void {
    this._deviceService
      .findAll(this._nodeId)
      .pipe(
        switchMap((response) =>
          of(
            response.data.filter(
              (device) => device.camera.type.toLowerCase() !== 'static'
            )
          )
        ),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message ?? error.message;
          this._toastService.showError(errorMessage);
          return [];
        })
      )
      .subscribe((devices) => (this.devices = devices));
  }

  enterSettingMode(item: RowItemModel) {
    this.editingRowItem = item;
  }

  exitSettingMode() {
    this.editingRowItem = undefined;
    this.postActionOptions = undefined;
  }

  saveAndExitSettingMode(data: ZoomAndCentralizeOptions | AutoTrackOptions) {
    this.editingRowItem!.postActionOptions = data;
    this.exitSettingMode();
  }

  add() {
    const item = new RowItemModel(
      this._nodeId,
      this._presetService,
      this._toastService
    );
    this.tableItemsSource.push(item);
  }

  remove() {
    this.tableItemsSource = this.tableItemsSource.filter((e) => !e.selected);
  }

  trackById(_: any, item: any): any {
    return item.id;
  }

  trackByValue(_: any, item: any): any {
    return item.value;
  }

  onCancelClicked() {}

  onSaveClicked() {
    const observables = this.tableItemsSource.map((rowItem) =>
      this.createOrUpdate(rowItem)
    );
    concat(...observables).subscribe({
      error: (error: HttpErrorResponse) => {
        this._toastService.showHttpError(error);
      },
      complete: () => {
        this._toastService.showSuccess('Update succesffully');
      },
    });
  }

  private createOrUpdate(rowItem: RowItemModel): Observable<any> {
    const data: CreateOrUpdateHandoverRequest = {
      is_enabled: true,
      preset_id: rowItem.presetId,
      target_device_id: rowItem.deviceId,
    };

    if (rowItem.postActionType === 'auto_track') {
      data.action = {
        auto_track: rowItem.postActionOptions as AutoTrackOptions,
      };
    } else if (rowItem.postActionType === 'zoom_and_centralize') {
      data.action = {
        zoom_and_centralize:
          rowItem.postActionOptions as ZoomAndCentralizeOptions,
      };
    }

    return rowItem.isNew
      ? this._handoverService
          .create(this._nodeId, this._deviceId, data)
          .pipe(tap((response) => (rowItem.id = response.data.id)))
      : this._handoverService.update(
          this._nodeId,
          this._deviceId,
          +rowItem.id,
          data
        );
  }
}
