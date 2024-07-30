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
  Observable,
  Subscription,
  catchError,
  combineLatest,
  concat,
  forkJoin,
  map,
  of,
  switchMap,
  takeLast,
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
import HandoverRowItemModel from './models';

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
  private _deleteItems: HandoverRowItemModel[] = [];

  editingRowItem: Nullable<HandoverRowItemModel>;
  postActionOptions: Nullable<
    (ZoomAndFocusOptions | AutoTrackingOptions) & {
      nodeId: string;
      deviceId: number;
      presetId: number;
    }
  >;
  tableItemsSource: HandoverRowItemModel[] = [];
  ptzCameras: Device[] = [];
  handovers: Handover[] = [];

  constructor() {
    this._navigationService.level3 = Level3Menu.CHUYEN_PTZ;
    this._activatedRoute.parent?.params.subscribe(
      ({ nodeId, cameraId: deviceId }) => {
        this._nodeId = nodeId;
        this._deviceId = +deviceId;
        this.tableItemsSource = [];
        this.editingRowItem = undefined;
        this.postActionOptions = null;
        this.ptzCameras = [];
        this.handovers = [];
        this._deleteItems = [];

        this._deviceService
          .findAll(this._nodeId)
          .pipe(
            map((response) =>
              response.data.filter(
                (device) => device.camera.type.toLowerCase() !== 'static'
              )
            ),
            catchError(
              this.handleHttpErrorAndReturnDefault.bind(
                this,
                'Error fetching camera list',
                []
              )
            )
          )
          .subscribe((ptzCameras) => (this.ptzCameras = ptzCameras));

        this.loadHandovers();
      }
    );
  }

  private loadHandovers() {
    this._handoverService
      .findAll(this._nodeId, this._deviceId)
      .pipe(
        map((response) =>
          response.data.map(
            (item) =>
              new HandoverRowItemModel(
                this._presetService,
                this._toastService,
                this._nodeId,
                this._deviceId,
                item
              )
          )
        ),
        catchError(
          this.handleHttpErrorAndReturnDefault.bind(
            this,
            'Error fetching handover list',
            []
          )
        )
      )
      .subscribe((items) => (this.tableItemsSource = items));
  }

  private handleHttpErrorAndReturnDefault(
    errorMessage: string,
    defaultValue: any,
    error: HttpErrorResponse
  ): Observable<any> {
    const message = error.error?.message ?? error.message;
    this._toastService.showError(errorMessage + ': ' + message);
    return of(defaultValue);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  trackById(_: any, item: any): any {
    return item.id;
  }

  trackByValue(_: any, item: any): any {
    return item.value;
  }

  trackByKey(_: any, { key }: any): any {
    return key;
  }

  enterSettingMode(item: HandoverRowItemModel) {
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
    this.tableItemsSource.push(
      new HandoverRowItemModel(
        this._presetService,
        this._toastService,
        this._nodeId,
        this._deviceId
      )
    );
  }

  remove() {
    this._deleteItems.push(
      ...this.tableItemsSource.filter((item) => item.selected && !item.isNew)
    );
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {
    this._deleteItems = [];
    this.loadHandovers();
  }

  onSaveClicked() {
    const deleteItems$ =
      this._deleteItems.length > 0
        ? this._deleteItems.map((item) =>
            this._handoverService
              .delete(this._nodeId, this._deviceId, item.id)
              .pipe(
                map(() => true),
                catchError(
                  this.handleHttpErrorAndReturnDefault.bind(
                    this,
                    'Error delete item: ',
                    false
                  )
                )
              )
          )
        : [];
    const creatOrUpdate$ = this.tableItemsSource.map((rowItem) =>
      this.createOrUpdate(rowItem)
    );
    concat(...deleteItems$, ...creatOrUpdate$)
      .pipe(
        takeWhile((result) => result),
        takeLast(1)
      )
      .subscribe({
        next: (result) =>
          result && this._toastService.showSuccess('Update succesffully'),
      });
  }

  private createOrUpdate(rowItem: HandoverRowItemModel): Observable<any> {
    const data: CreateOrUpdateHandoverRequest = {
      is_enabled: true,
      preset_id: rowItem.presetId,
      target_device_id: rowItem.targetDeviceId,
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
      ? this._handoverService.create(this._nodeId, this._deviceId, data).pipe(
          tap((response) => (rowItem.id = response.data.id)),
          map(() => true),
          catchError(
            this.handleHttpErrorAndReturnDefault.bind(
              this,
              'Error creating new handover',
              false
            )
          )
        )
      : this._handoverService
          .update(this._nodeId, this._deviceId, +rowItem.id, data)
          .pipe(
            map(() => true),
            catchError(
              this.handleHttpErrorAndReturnDefault.bind(
                this,
                'Error updating exiting handover',
                false
              )
            )
          );
  }
}
