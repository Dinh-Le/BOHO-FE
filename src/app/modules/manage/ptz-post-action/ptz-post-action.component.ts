import { Component } from '@angular/core';
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
import {
  catchError,
  concat,
  finalize,
  map,
  Observable,
  of,
  takeWhile,
  zip,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';
import {
  CreatePostAction,
  PostActionService,
} from 'src/app/data/service/post-action.service';

@Component({
  selector: 'app-ptz-post-action',
  templateUrl: 'ptz-post-action.component.html',
  styleUrls: [
    '../camera-detail/handover-settings/handover-settings.component.scss',
  ],
})
export class PTZPostActionComponent {
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
        map((response) =>
          response.data.map(
            (postAction) => new PTZPostActionItemModel(postAction)
          )
        ),
        catchError(
          this.showHttpErrorAndReturnDefault.bind(
            this,
            'Error fetching post action list',
            []
          )
        )
      )
      .subscribe((items) => (this.tableItemsSource = items));
  }

  private showHttpErrorAndReturnDefault(
    message: string,
    defaultValue: any,
    error: HttpErrorResponse
  ) {
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
      ...this.tableItemsSource.filter(
        (item) => item.selected && !item.isNewItem
      )
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
    const observables$: Observable<any>[] = [];
    const newItems = this.tableItemsSource.filter((item) => item.isNewItem);
    const updateItems = this.tableItemsSource.filter((item) => !item.isNewItem);

    if (newItems.length > 0) {
      const data: CreatePostAction[] = newItems.map(
        (item) =>
          ({
            preset_id: item.presetId,
            auto_track:
              item.postActionType === 'auto_track'
                ? item.postActionOptions
                : null,
            zoom_and_centralize:
              item.postActionType === 'zoom_and_centralize'
                ? item.postActionOptions
                : null,
          } as CreatePostAction)
      );

      const createNewItems$ = this.postActionService
        .create(this.nodeId, this.deviceId, data)
        .pipe(
          map((response) => {
            for (let i = 0; i < newItems.length; i++) {
              newItems[i].id = response.data[i];
            }

            return true;
          }),
          catchError(
            this.showHttpErrorAndReturnDefault.bind(
              this,
              'Error creating post action',
              false
            )
          )
        );
      observables$.push(createNewItems$);
    } else {
      observables$.push(of(true));
    }

    if (updateItems.length > 0) {
      const data: PostAction[] = updateItems.map((item) => ({
        id: item.id,
        is_enabled: true,
        preset_id: item.presetId,
        auto_track:
          item.postActionType === 'auto_track'
            ? (item.postActionOptions as AutoTrackOptions)
            : null,
        zoom_and_centralize:
          item.postActionType === 'zoom_and_centralize'
            ? (item.postActionOptions as ZoomAndCentralizeOptions)
            : null,
      }));

      const updateItems$ = this.postActionService
        .update(this.nodeId, this.deviceId, data)
        .pipe(
          catchError(
            this.showHttpErrorAndReturnDefault.bind(
              this,
              'Error updating post action',
              false
            )
          )
        );
      observables$.push(updateItems$);
    } else {
      observables$.push(of(true));
    }

    if (this._deleteItems.length > 0) {
      const deleteItems$ = concat(
        ...this._deleteItems.map((item) =>
          this.postActionService.delete(this.nodeId, this.deviceId, item.id)
        )
      ).pipe(
        map(() => true),
        catchError(
          this.showHttpErrorAndReturnDefault.bind(
            this,
            'Error removing post action',
            false
          )
        ),
        takeWhile((result) => !result),
        finalize(() => (this._deleteItems = []))
      );
      observables$.push(deleteItems$);
    } else {
      observables$.push(of(true));
    }

    zip(observables$).subscribe(
      ([createResult, updateResult, deleteResult]) => {
        if (createResult && updateResult && deleteResult) {
          this.toastService.showSuccess('Save successfully');
        }
      }
    );
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
