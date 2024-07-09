import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { catchError, filter, of, switchMap } from 'rxjs';
import { Rule } from 'src/app/data/schema/boho-v2/rule';
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
import { MenuItem } from '../menu-item';

@Component({
  selector: 'app-post-action',
  templateUrl: 'post-action.component.html',
  styleUrls: [
    '../camera-detail/handover-settings/handover-settings.component.scss',
  ],
})
export class PostActionComponent {
  @HostBinding('class') classNames = 'flex-grow-1 d-flex flex-column';

  readonly menuItemsSource: MenuItem[] = [
    {
      title: 'Quy tắc',
      icon: 'bi bi-list-check',
      path: '/rule',
    },
    {
      title: 'Lịch trình',
      icon: 'bi bi-clock',
      path: '/schedule',
    },
    {
      title: 'Hành động sau',
      icon: 'bi bi-cloud-fog2',
      selected: true,
    },
  ];

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

  constructor(
    navigationService: NavigationService,
    activatedRoute: ActivatedRoute,
    ruleService: RuleService,
    private readonly toastService: ToastService
  ) {
    navigationService.level3 = Level3Menu.POST_ACTION;
    activatedRoute.params.subscribe(({ nodeId, cameraId: deviceId }) => {
      this.parentPath = `/manage/device-rule/node/${nodeId}/camera/${deviceId}`;

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
    this.tableItemsSource.push(new PostActionItemModel());
  }

  onDeleteClicked() {
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {}

  onSaveClicked() {}

  onPostActionChanged(item: PostActionItemModel) {
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
    return !!item.rule;
  }

  enterSettingMode(item: PostActionItemModel) {
    this.postActionOptions = Object.assign({}, item.postActionOptions);
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
}