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
import { Rule } from 'src/app/data/schema/boho-v2/rule';
import {
  AutoTrackOptions,
  ZoomAndCentralizeOptions,
} from 'src/app/data/schema/boho-v2';
import { InvalidId } from 'src/app/data/constants';
import { Nullable } from '@shared/shared.types';

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
  editingItem: Nullable<PostActionItemModel>;
  selectedRuleIds: number[] = [];
  presetId: number = +InvalidId;
  deviceId: number = +InvalidId;
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
      this.editingItem = null;
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
    this.tableItemsSource.push(new PostActionItemModel());
  }

  onDeleteClicked() {
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {}

  onSaveClicked() {}

  trackById(_: any, item: any): any {
    return item.id;
  }

  trackByValue(_: any, item: any): any {
    return item.value;
  }

  enterSettingMode(item: PostActionItemModel) {
    this.editingItem = item;
  }

  exitSettingMode() {
    this.editingItem = undefined;
  }

  saveAndExitSettingMode(data: ZoomAndCentralizeOptions | AutoTrackOptions) {
    this.editingItem!.postActionOptions = data;
    this.exitSettingMode();
  }

  onRuleMenuOpen({ id }: PostActionItemModel) {
    this.selectedRuleIds = this.tableItemsSource.flatMap((item) =>
      item.id === id ? [] : item.ruleIds
    );
  }
}
