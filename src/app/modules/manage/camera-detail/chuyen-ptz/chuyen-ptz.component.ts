import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  Host,
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
  filter,
  of,
  switchMap,
} from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { Device } from 'src/app/data/schema/boho-v2';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import {
  AutoTrackingOptions,
  PostActionType,
  ZoomAndFocusOptions,
} from '../models';

class RowItemModel {
  id?: number;
  selected: boolean = false;
  device?: Device;
  preset?: Preset;
  presets$: Observable<Preset[]> = of([]);
  postAction: PostActionType = 'none';
  postActionOptions?: AutoTrackingOptions | ZoomAndFocusOptions;
}

@Component({
  selector: 'app-chuyen-ptz',
  templateUrl: 'chuyen-ptz.component.html',
  styleUrls: ['chuyen-ptz.component.scss'],
})
export class ChuyenPTZComponent implements OnInit, OnDestroy {
  @HostBinding('class') classNames =
    'flex-grow-1 d-flex flex-column my-bg-default';

  readonly postActionItemsSource: SelectItemModel[] = [
    {
      label: 'Không',
      value: 'none',
    },
    {
      label: 'Căn giữa & phóng to',
      value: 'focusAndZoom',
    },
    {
      label: 'Tự động theo dõi',
      value: 'autoTracking',
    },
  ];

  private _subscriptions: Subscription[] = [];
  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  private _nodeId: string = '';

  editingRowItem?: RowItemModel;
  tableItemsSource: RowItemModel[] = [];
  devices: Device[] = [];
  settingMode = false;

  constructor() {
    this._navigationService.level3 = Level3Menu.CHUYEN_PTZ;
  }

  ngOnInit(): void {
    this._activatedRoute.parent?.params.subscribe(({ nodeId }) => {
      this.tableItemsSource = [];

      if (this._nodeId !== nodeId) {
        this._nodeId = nodeId;
        this.devices = [];
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
    });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  onDeviceChanged(item: RowItemModel) {
    item.presets$ = this._presetService
      .findAll(item.device!.node_id!, item.device!.id)
      .pipe(
        switchMap((response) => of(response.data)),
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message ?? error.message;
          this._toastService.showError(errorMessage);
          return [];
        })
      );
  }

  onPostActionChanged(item: RowItemModel) {
    switch (item.postAction) {
      case 'focusAndZoom':
        item.postActionOptions = {
          zoomInLevel: 1,
          trackingDuration: 2,
        };
        break;
      case 'autoTracking':
        item.postActionOptions = {
          zoomInLevel: 1,
          trackingDuration: 30,
          pan: 3,
          tilt: 3,
          waitingTime: 5,
        };
        break;
      default:
        item.postActionOptions = undefined;
        break;
    }
  }

  enterSettingMode(item: RowItemModel) {
    this.editingRowItem = item;
    this.settingMode = true;
  }

  exitSettingMode() {
    this.editingRowItem = undefined;
    this.settingMode = false;
  }

  saveAndExitSettingMode(data: ZoomAndFocusOptions | AutoTrackingOptions) {
    this.editingRowItem!.postActionOptions = data;
    this.exitSettingMode();
  }

  add() {
    const item = new RowItemModel();
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
}
