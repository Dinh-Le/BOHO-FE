import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { catchError, of, switchMap } from 'rxjs';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { RuleService } from 'src/app/data/service/rule.service';
import { PostActionItemModel } from './models';
import {
  AutoTrackingOptions,
  ZoomAndFocusOptions,
} from '../camera-detail/models';
import { Rule } from 'src/app/data/schema/boho-v2/rule';

@Component({
  selector: 'app-post-action',
  templateUrl: 'post-action.component.html',
  styleUrls: [
    '../camera-detail/handover-settings/handover-settings.component.scss',
  ],
})
export class PostActionComponent {
  @HostBinding('class') classNames = 'flex-grow-1 d-flex flex-column';

  readonly postActionItemsSource: SelectItemModel[] = [
    {
      label: 'Căn giữa & phóng to',
      value: 'focusAndZoom',
    },
    {
      label: 'Tự động theo dõi',
      value: 'autoTracking',
    },
  ];

  parentPath = '';
  rules: Rule[] = [];
  tableItemsSource: PostActionItemModel[] = [];
  editingItem?: PostActionItemModel;
  postActionOptions?:
    | ZoomAndFocusOptions
    | (AutoTrackingOptions & {
        nodeId: string;
        deviceId: string;
        presetId: number;
      });
  selectedRuleIds: number[] = [];
  presetId: number = 0;
  deviceId: string = '';
  nodeId: string = '';

  constructor(
    navigationService: NavigationService,
    activatedRoute: ActivatedRoute,
    ruleService: RuleService,
    private readonly toastService: ToastService
  ) {
    navigationService.level3 = Level3Menu.POST_ACTION;
    activatedRoute.params.subscribe(({ nodeId, cameraId: deviceId }) => {
      this.parentPath = `/manage/device-rule/node/${nodeId}/camera/${deviceId}`;
      this.nodeId = nodeId;
      this.deviceId = deviceId;
      this.selectedRuleIds = [];
      this.editingItem = undefined;
      this.postActionOptions = undefined;
      this.tableItemsSource = [];

      ruleService
        .findAll(nodeId, deviceId)
        .pipe(
          switchMap(({ data }) => of(data)),
          catchError((err: HttpErrorResponse) => {
            const message = err.error?.message ?? err.message;
            this.toastService.showError(message);

            return of([]);
          })
        )
        .subscribe((rules) => (this.rules = rules));
    });
  }

  onAddClicked() {
    const newItem = new PostActionItemModel();
    newItem.id = this.tableItemsSource.length;
    this.tableItemsSource.push(newItem);
  }

  onDeleteClicked() {
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {}

  onSaveClicked() {}

  onPostActionChanged(item: PostActionItemModel) {
    console.log(item);
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
        this.postActionOptions = undefined;
        break;
    }
  }

  trackById(_: any, item: any): any {
    return item.id;
  }

  trackByValue(_: any, item: any): any {
    return item.value;
  }

  canEnterSettingMode(item: PostActionItemModel) {
    return item.ruleIds.length > 0;
  }

  enterSettingMode(item: PostActionItemModel) {
    this.postActionOptions = Object.assign({}, item.postActionOptions, {
      nodeId: this.nodeId,
      deviceId: this.deviceId,
    });
    console.log(this.postActionOptions);
    this.editingItem = item;
  }

  exitSettingMode() {
    this.editingItem = undefined;
    this.postActionOptions = undefined;
  }

  saveAndExitSettingMode(data: ZoomAndFocusOptions | AutoTrackingOptions) {
    this.editingItem!.postActionOptions = data;
    this.exitSettingMode();
  }

  onRuleMenuOpen({ id }: PostActionItemModel) {
    this.selectedRuleIds = this.tableItemsSource.flatMap((item) =>
      item.id === id ? [] : item.ruleIds
    );
  }
}
