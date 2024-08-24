import { Component, HostBinding } from '@angular/core';
import { PTZPostActionItemModel } from './models';
import { Nullable } from '@shared/shared.types';
import {
  AutoTrackOptions,
  PostAction,
  PostActionTypeModel as PostActionTypeModel,
  ZoomAndCentralizeOptions,
} from 'src/app/data/schema/boho-v2';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { PostActionTypes } from 'src/app/data/constants';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { PresetService } from 'src/app/data/service/preset.service';
import { catchError, concat, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';
import { PostActionService } from 'src/app/data/service/post-action.service';

@Component({
  selector: 'app-ptz-post-action',
  templateUrl: 'ptz-post-action.component.html',
  styleUrls: [
    '../camera-detail/handover-settings/handover-settings.component.scss',
  ],
})
export class PTZPostActionComponent {
  @HostBinding('class')
  classNames = 'flex-grow-1 d-flex flex-column';

  private _deleteItems: PTZPostActionItemModel[] = [];
  tableItemsSource: PTZPostActionItemModel[] = [];
  editingItem: Nullable<PTZPostActionItemModel>;
  presets: Preset[] = [];
  nodeId: string = '';
  deviceId: number = 0;

  get postActionTypesSource(): PostActionTypeModel[] {
    return PostActionTypes;
  }

  constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly postActionService: PostActionService,
    private readonly presetService: PresetService,
    private readonly toastService: ToastService
  ) {
    this.navigationService.level3 = Level3Menu.PTZ_POST_ACTION;
    this.activatedRoute.params.subscribe(({ nodeId, cameraId: deviceId }) =>
      this.updateAndLoadData(nodeId, +deviceId)
    );
  }

  private updateAndLoadData(nodeId: string, deviceId: number): void {
    this.nodeId = nodeId;
    this.deviceId = deviceId;
    this.presets = [];
    this.tableItemsSource = [];

    this.presetService
      .findAll(nodeId, deviceId)
      .pipe(
        map((response) => response.data),
        catchError(
          this.showHttpErrorAndReturnDefault.bind(
            this,
            'Error fetching preset list',
            []
          )
        )
      )
      .subscribe((presets) => (this.presets = presets));

    this.loadTableData();
  }

  private loadTableData() {
    this.postActionService
      .findAll(this.nodeId, this.deviceId)
      .pipe(
        catchError(
          this.showHttpErrorAndReturnDefault.bind(
            this,
            'Error fetching post action list',
            []
          )
        )
      )
      .subscribe(
        (postActions: PostAction[]) =>
          (this.tableItemsSource = postActions.map(
            (postAction) => new PTZPostActionItemModel(postAction)
          ))
      );
  }

  private showHttpErrorAndReturnDefault(
    message: string,
    defaultValue: any,
    error: HttpErrorResponse
  ) {
    console.error(error);

    this.toastService.showError(
      `${message}: ${error.error?.message ?? error.message}`
    );

    return of(defaultValue);
  }

  trackById(_: any, { id }: any) {
    return id;
  }

  //#region  Event handlers
  onAddClicked() {
    this.tableItemsSource.push(new PTZPostActionItemModel());
  }

  onDeleteClicked() {
    this._deleteItems.push(
      ...this.tableItemsSource.filter((item) => item.selected && !item.isNew)
    );
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {
    this._deleteItems = [];
    this.loadTableData();
  }

  onSaveClicked() {
    const showError = (
      message: string,
      error: HttpErrorResponse
    ): Observable<any> => {
      this.toastService.showError(
        `${message}: ${error.error?.message ?? error.message}`
      );

      return throwError(() => error);
    };
    const newItems = this.tableItemsSource.filter((item) => item.isNew);
    const existingItems = this.tableItemsSource.filter((item) => !item.isNew);

    const deleteItems$ =
      this._deleteItems.length > 0
        ? this._deleteItems.map((item) =>
            this.postActionService
              .delete(this.nodeId, this.deviceId, item.id)
              .pipe(
                catchError(
                  showError.bind(this, `Lỗi xóa hành động sau ${item.id}`)
                )
              )
          )
        : [];

    const createItems$ =
      newItems.length > 0
        ? this.postActionService
            .create(
              this.nodeId,
              this.deviceId,
              newItems.map((item) => ({
                is_enable: true,
                preset_id: item.presetId,
                auto_track:
                  item.postActionType === 'auto_track'
                    ? (item.postActionOptions as AutoTrackOptions)
                    : null,
                zoom_and_centralize:
                  item.postActionType === 'zoom_and_centralize'
                    ? item.postActionOptions
                    : null,
              }))
            )
            .pipe(
              tap((ids) => {
                for (let i = 0; i < ids.length; i++) {
                  newItems[i].id = ids[i];
                }
              }),
              map(() => true),
              catchError(showError.bind(this, 'Lỗi tạo hành động sau'))
            )
        : of(true);

    const updateItems$ =
      existingItems.length > 0
        ? this.postActionService
            .update(
              this.nodeId,
              this.deviceId,
              existingItems.map((item) => ({
                id: item.id,
                is_enable: true,
                preset_id: item.presetId,
                auto_track:
                  item.postActionType === 'auto_track'
                    ? (item.postActionOptions as AutoTrackOptions)
                    : null,
                zoom_and_centralize:
                  item.postActionType === 'zoom_and_centralize'
                    ? item.postActionOptions
                    : null,
              }))
            )
            .pipe(
              catchError(showError.bind(this, 'Lỗi cập nhật hành động sau'))
            )
        : of(true);

    concat(...deleteItems$, createItems$, updateItems$).subscribe({
      error: console.error,
      complete: () => {
        this.toastService.showSuccess('Lưu thành công');
        this._deleteItems = [];
      },
    });
  }

  enterSettingMode(rowItem: PTZPostActionItemModel) {
    this.editingItem = rowItem;
  }

  exitSettingMode() {
    this.editingItem = null;
  }

  saveAndExitSettingMode(options: AutoTrackOptions | ZoomAndCentralizeOptions) {
    this.editingItem!.postActionOptions = options;
    this.exitSettingMode();
  }
  //#endregion
}
