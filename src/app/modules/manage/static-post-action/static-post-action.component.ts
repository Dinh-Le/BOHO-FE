import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import {
  BehaviorSubject,
  catchError,
  concat,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { RuleService } from 'src/app/data/service/rule.service';
import { StaticPostActionItemModel } from './models';
import { Rule } from 'src/app/data/schema/boho-v2/rule';
import { HandoverLinking, PostAction } from 'src/app/data/schema/boho-v2';
import { InvalidId } from 'src/app/data/constants';
import { PostActionService } from 'src/app/data/service/post-action.service';
import { HandoverLinkingService } from 'src/app/data/service/handover-linking.service';
import { DeviceService } from 'src/app/data/service/device.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { Preset } from 'src/app/data/schema/boho-v2/preset';

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
  postActions$?: Observable<PostAction[]>;
  rules$?: Observable<Rule[]>;

  _presetDb: Record<number, Preset[]> = {};
  _currentNodeId = new BehaviorSubject<string>('');
  _currentNodeIdSubscription = this._currentNodeId
    .pipe(
      distinctUntilChanged(),
      tap(() => (this._presetDb = {})),
      switchMap((nodeId) =>
        this.deviceService.findAll(nodeId).pipe(
          map((response) =>
            response.data.filter((e) => e.camera.type === 'PTZ')
          ),
          map((devices) =>
            concat(
              ...devices.map((device) =>
                this.presetService.findAll(nodeId, device.id).pipe(
                  map((response) => ({
                    nodeId,
                    deviceId: device.id,
                    presets: response.data,
                  })),
                  catchError(
                    this.showHttpErrorAndReturnDefault.bind(
                      this,
                      `'Lỗi lấy danh sách preset của camera ${device.name}`,
                      {
                        nodeId,
                        deviceId: device.id,
                        presets: [],
                      }
                    )
                  )
                )
              )
            )
          ),
          catchError(
            this.showHttpErrorAndReturnDefault.bind(
              this,
              'Lỗi lấy danh sách PTZ camera',
              []
            )
          )
        )
      )
    )
    .subscribe((data) => (this._presetDb[data.deviceId] = data.preset));

  constructor(
    private readonly navigationService: NavigationService,
    private readonly deviceService: DeviceService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly ruleService: RuleService,
    private readonly presetService: PresetService,
    private readonly postActionService: PostActionService,
    private readonly handoverLinkingService: HandoverLinkingService,
    private readonly toastService: ToastService
  ) {
    this.navigationService.level3 = Level3Menu.POST_ACTION;
    this.activatedRoute.params.subscribe(({ nodeId, cameraId: deviceId }) => {
      this.nodeId = nodeId;
      this.deviceId = deviceId;

      this._currentNodeId.next(this.nodeId);

      this.resetStates();

      this.postActions$ = this.postActionService
        .findAll(this.nodeId, this.deviceId)
        .pipe(
          map((response) => response.data),
          catchError(
            this.showHttpErrorAndReturnDefault.bind(
              this,
              'Lỗi lấy danh sách các hành động sau',
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

  ngOnDestroy(): void {
    this._currentNodeIdSubscription.unsubscribe();
  }

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
      ...this.tableItemsSource.filter((item) => item.selected && item.isNew)
    );
    this.tableItemsSource = this.tableItemsSource.filter(
      (item) => !item.selected
    );
  }

  onCancelClicked() {
    this.loadTableData();
  }

  onSaveClicked() {}

  trackById(_: any, item: any): any {
    return item.id;
  }

  onRuleMenuOpen({ id }: StaticPostActionItemModel) {
    this.selectedRuleIds = this.tableItemsSource.flatMap((item) =>
      item.id === id ? [] : item.ruleIds
    );
  }
}
