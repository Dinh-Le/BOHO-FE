import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  concat,
  distinctUntilChanged,
  finalize,
  last,
  map,
  mergeAll,
  of,
  skip,
  switchMap,
  takeWhile,
  tap,
  throwError,
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
  CreateHandoverDto,
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
export class HandoverSettingsComponent implements OnDestroy {
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

  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  private _handoverService = inject(HandoverService);

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

  handovers: Handover[] = [];

  private _currentNodeId = new BehaviorSubject<string>('');
  ptzCameras = new BehaviorSubject<Device[]>([]);
  private _presetIdToDeviceIdMap: Record<number, number> = {};
  private _refreshTableData = new Subject();

  private _currentNodeIdSubscription = this._currentNodeId
    .pipe(
      skip(1),
      switchMap((nodeId) =>
        this._deviceService.findAll(nodeId).pipe(
          map((response) =>
            response.data.filter((device) => device.camera.type === 'PTZ')
          ),
          catchError(
            this.handleHttpErrorAndReturnDefault.bind(
              this,
              'Lỗi lấy danh sách các PTZ camera',
              []
            )
          )
        )
      )
    )
    .subscribe((devices) => this.ptzCameras.next(devices));

  private _ptzCamerasSubscription = this.ptzCameras
    .pipe(
      skip(1),
      map((devices) => {
        this._presetIdToDeviceIdMap = {};
        return concat(
          ...devices.map((device) =>
            this._presetService
              .findAll(this._currentNodeId.value, device.id)
              .pipe(
                map((response) => response.data),
                catchError(
                  this.handleHttpErrorAndReturnDefault.bind(
                    this,
                    `Lỗi lấy danh sách các điểm preset của camera ${device.name}`,
                    []
                  )
                )
              )
          )
        ).pipe(
          tap((data) => {
            for (const preset of data) {
              this._presetIdToDeviceIdMap[preset.id] = preset.device_id;
            }
          }),
          finalize(() => this._refreshTableData.next(0))
        );
      }),
      mergeAll()
    )
    .subscribe();

  private _refreshTableDataSubscription = this._refreshTableData
    .pipe(
      tap(() => (this.tableItemsSource = [])),
      switchMap(() =>
        this._handoverService
          .findAll(this._currentNodeId.value, this._deviceId)
          .pipe(
            catchError(
              this.handleHttpErrorAndReturnDefault.bind(
                this,
                'Lỗi tải danh sách chuyền PTZ',
                []
              )
            )
          )
      )
    )
    .subscribe(
      (handovers: Handover[]) =>
        (this.tableItemsSource = handovers.map(
          (item) =>
            new HandoverRowItemModel(
              this._presetService,
              this._toastService,
              this._currentNodeId.value,
              this._presetIdToDeviceIdMap[item.preset_id] ?? +InvalidId,
              item
            )
        ))
    );

  constructor() {
    this._navigationService.level3 = Level3Menu.CHUYEN_PTZ;
    this._activatedRoute.parent?.params.subscribe(
      ({ nodeId, cameraId: deviceId }) => {
        this._deviceId = +deviceId;
        this.tableItemsSource = [];
        this.editingRowItem = undefined;
        this.postActionOptions = null;
        this.handovers = [];
        this._deleteItems = [];

        if (this._currentNodeId.value !== nodeId) {
          this._currentNodeId.next(nodeId);
        } else {
          this._refreshTableData.next(0);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this._currentNodeIdSubscription.unsubscribe();
    this._ptzCamerasSubscription.unsubscribe();
    this._refreshTableDataSubscription.unsubscribe();
  }

  private handleHttpErrorAndReturnDefault(
    errorMessage: string,
    defaultValue: any,
    error: HttpErrorResponse
  ): Observable<any> {
    console.error(error);

    const message = error.error?.message ?? error.message;
    this._toastService.showError(errorMessage + ': ' + message);

    return of(defaultValue);
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
        this._currentNodeId.value,
        +InvalidId
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
    this._refreshTableData.next(0);
  }

  onSaveClicked() {
    const showErrorMessage = (
      message: string,
      error: HttpErrorResponse
    ): Observable<any> => {
      this._toastService.showError(
        `${message}: ${error.error?.message ?? error.message}`
      );

      return throwError(() => error);
    };
    const convertToCreateHandoverDto = (
      item: HandoverRowItemModel
    ): CreateHandoverDto => ({
      is_enable: true,
      preset_id: item.presetId,
      action:
        item.postActionType === 'auto_track'
          ? {
              auto_track: item.postActionOptions as AutoTrackOptions,
            }
          : item.postActionType === 'zoom_and_centralize'
          ? {
              zoom_and_centralize:
                item.postActionOptions as ZoomAndCentralizeOptions,
            }
          : {},
    });
    const newItems = this.tableItemsSource.filter((item) => item.isNew);
    const existingItems = this.tableItemsSource.filter((item) => !item.isNew);

    const deleteItems$ =
      this._deleteItems.length > 0
        ? this._deleteItems.map((item) =>
            this._handoverService
              .delete(this._currentNodeId.value, this._deviceId, item.id)
              .pipe(
                map(() => true),
                catchError(showErrorMessage.bind(this, 'Lỗi xóa chuyền PTZ'))
              )
          )
        : [];

    const createItems$ =
      newItems.length > 0
        ? this._handoverService
            .create(
              this._currentNodeId.value,
              this._deviceId,
              newItems.map(convertToCreateHandoverDto)
            )
            .pipe(
              map((ids) => {
                for (let i = 0; i < ids.length; i++) {
                  newItems[i].id = ids[i];
                }

                return true;
              }),
              catchError(showErrorMessage.bind(this, 'Lỗi tạo chuyền PTZ'))
            )
        : of(true);

    const updateItems$ =
      existingItems.length > 0
        ? this._handoverService
            .update(
              this._currentNodeId.value,
              this._deviceId,
              existingItems.map(convertToCreateHandoverDto)
            )
            .pipe(
              map(() => true),
              catchError(
                showErrorMessage.bind(this, 'Lỗi chỉnh sửa chuyền PTZ')
              )
            )
        : of(true);

    concat(...deleteItems$, createItems$, updateItems$)
      .pipe(takeWhile((result) => result))
      .subscribe({
        error: (error) => console.error(error),
        complete: () => {
          this._toastService.showSuccess('Lưu thành công');
          this._deleteItems = [];
        },
      });
  }
}
