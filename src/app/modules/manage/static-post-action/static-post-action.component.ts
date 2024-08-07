import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import {
  catchError,
  concat,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { RuleService } from 'src/app/data/service/rule.service';
import { StaticPostActionItemModel } from './models';
import { Rule } from 'src/app/data/schema/boho-v2/rule';
import { Handover, HandoverLinking } from 'src/app/data/schema/boho-v2';
import { InvalidId } from 'src/app/data/constants';
import { HandoverLinkingService } from 'src/app/data/service/handover-linking.service';
import { DeviceService } from 'src/app/data/service/device.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { HandoverService } from 'src/app/data/service/handover.service';

@Component({
  selector: 'app-post-action',
  templateUrl: 'static-post-action.component.html',
  styleUrls: [
    '../camera-detail/handover-settings/handover-settings.component.scss',
  ],
})
export class StaticPostActionComponent implements OnDestroy {
  @HostBinding('class') classNames = 'flex-grow-1 d-flex flex-column';

  tableItemsSource: StaticPostActionItemModel[] = [];
  _removedItems: StaticPostActionItemModel[] = [];
  selectedRuleIds: number[] = [];
  deviceId: number = +InvalidId;
  nodeId: string = '';
  handovers$?: Observable<Handover[]>;
  rules$?: Observable<Rule[]>;

  constructor(
    private readonly navigationService: NavigationService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ruleService: RuleService,
    private readonly handoverService: HandoverService,
    private readonly handoverLinkingService: HandoverLinkingService,
    private readonly toastService: ToastService
  ) {
    this.navigationService.level3 = Level3Menu.POST_ACTION;
    this.activatedRoute.params.subscribe(({ nodeId, cameraId: deviceId }) => {
      this.nodeId = nodeId;
      this.deviceId = deviceId;

      this.resetStates();

      this.handovers$ = this.handoverService
        .findAll(this.nodeId, this.deviceId)
        .pipe(
          catchError(
            this.showHttpErrorAndReturnDefault.bind(
              this,
              'Lỗi lấy danh sách chuyền PTZ',
              []
            )
          )
        );
      this.rules$ = this.ruleService.findAll(this.nodeId, this.deviceId).pipe(
        map((response) => response.data),
        catchError(
          this.showHttpErrorAndReturnDefault.bind(
            this,
            'Lỗi lấy danh sách các quy tắc',
            []
          )
        )
      );

      this.loadTableData();
    });
  }

  ngOnDestroy(): void {}

  private resetStates(): void {
    this.selectedRuleIds = [];
    this.tableItemsSource = [];
  }

  private loadTableData() {
    this._removedItems = [];

    this.handoverLinkingService
      .findAll(this.nodeId, this.deviceId)
      .pipe(
        catchError(
          this.showHttpErrorAndReturnDefault.bind(
            this,
            'Lỗi lấy danh sách các hành động sau',
            []
          )
        )
      )
      .subscribe((linking_data: HandoverLinking[]) => {
        this.tableItemsSource = linking_data.map(
          (item) => new StaticPostActionItemModel(item)
        );
      });
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

  onAddClicked() {
    this.tableItemsSource.push(new StaticPostActionItemModel());
  }

  onDeleteClicked() {
    this._removedItems.push(
      ...this.tableItemsSource.filter((item) => item.selected)
    );
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {
    this.loadTableData();
  }

  onSaveClicked() {
    const showHttpError = (
      message: string,
      error: HttpErrorResponse
    ): Observable<any> => {
      this.toastService.showHttpError(error, message);

      return throwError(() => error);
    };

    const deleteHandoverIds = this._removedItems
      .map((item) => item.handoverId)
      .filter(
        (handoverId) =>
          !this.tableItemsSource.some((item) => item.handoverId == handoverId)
      );
    const deleteHandoverLinking$ =
      deleteHandoverIds.length > 0
        ? this.handoverLinkingService
            .delete(this.nodeId, this.deviceId, deleteHandoverIds)
            .pipe(catchError(showHttpError.bind(this, 'Lỗi xóa hành động sau')))
        : of(true);

    const updateHandoverLinking$ =
      this.tableItemsSource.length > 0
        ? this.handoverLinkingService
            .create(
              this.nodeId,
              this.deviceId,
              this.tableItemsSource.map((item) => ({
                handover_id: item.handoverId,
                rule_ids: item.ruleIds,
              }))
            )
            .pipe(
              catchError(
                showHttpError.bind(this, 'Lỗi cập nhật danh sách hành động sau')
              )
            )
        : of(true);
    concat(deleteHandoverLinking$, updateHandoverLinking$).subscribe({
      error: console.error,
      complete: () => {
        this.toastService.showSuccess('Lưu thành công');
        this._removedItems = [];
      },
    });
  }

  trackById(_: any, { id }: any): any {
    return id;
  }

  trackByKey(_: any, { key }: any): any {
    return key;
  }

  onRuleMenuOpen({ key }: StaticPostActionItemModel) {
    this.selectedRuleIds = this.tableItemsSource.flatMap((item) =>
      item.key === key ? [] : item.ruleIds
    );
  }
}
