import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowItemModelBase,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { SelectItemModel } from '@shared/models/select-item-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  EventSourceComponent,
  EventSourceRowItem,
} from './event-source/event-source.component';
import {
  Level2Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { IntegrationService } from 'src/app/data/service/integration.service';
import { RuleService } from 'src/app/data/service/rule.service';
import { MilestoneService } from 'src/app/data/service/milestone.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, switchMap, zip } from 'rxjs';
import { Integration } from 'src/app/data/schema/boho-v2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '@app/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PresetService } from 'src/app/data/service/preset.service';
import { ScheduleService } from 'src/app/data/service/schedule.service';
import { Milestone } from 'src/app/data/schema/boho-v2/milestone';

class RowItemModel extends ExpandableTableRowItemModelBase {
  form = new FormGroup({
    id: new FormControl<number | string>(v4(), [Validators.required]),
    name: new FormControl<string>('', [Validators.required]),
    type: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    source: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    guid: new FormControl<string>('', [Validators.required]),
    isSendSnapshot: new FormControl<boolean>(false, [Validators.required]),
    ruleIdList: new FormControl<number[]>([], [Validators.required]),
  });

  get invalid() {
    return this.form.invalid;
  }

  get id() {
    return this.form.get('id')!.value!;
  }

  set id(value: number | string) {
    this.form.get('id')?.setValue(value);
  }

  get name() {
    return this.form.get('name')!.value!;
  }

  get type() {
    return this.form.get('type')?.value;
  }

  get source() {
    return this.form.get('source')?.value;
  }

  get guid() {
    return this.form.get('guid')!.value!;
  }

  get isSendSnapshot() {
    return this.form.get('isSendSnapshot')!.value!;
  }

  get ruleIdList() {
    return this.form.get('ruleIdList')!.value!;
  }

  set ruleIdList(ids: number[]) {
    this.form.get('ruleIdList')?.setValue(ids);
  }

  setData(
    data: Integration,
    type: SelectItemModel,
    source?: SelectItemModel
  ): void {
    this.form.reset({
      id: data.id,
      name: data.service_name,
      type: type,
      source,
      guid: data.guid,
      isSendSnapshot: data.is_send_snapshot,
      ruleIdList: data.rule_ids,
    });
  }
}

@Component({
  selector: 'app-integration',
  templateUrl: 'integration.component.html',
  styleUrls: ['../shared/my-input.scss'],
})
export class IntegrationComponent implements OnInit, OnDestroy {
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _integrationService = inject(IntegrationService);
  private _ruleService = inject(RuleService);
  private _presetService = inject(PresetService);
  private _scheduleService = inject(ScheduleService);
  private _milestoneService = inject(MilestoneService);
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);

  private _nodeId: string = '';
  private _deviceId: number = 0;
  private _subscriptions: Subscription[] = [];

  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên',
      prop: 'name',
      sortable: true,
    },
    {
      label: 'Loại',
      prop: 'type.label',
      sortable: true,
    },
    {
      label: 'Đích',
      prop: 'source.label',
      sortable: true,
    },
  ];
  types: SelectItemModel[] = ['Milestone'].map((e) => ({
    value: e,
    label: e,
  }));
  sources: SelectItemModel[] = [];
  rules: EventSourceRowItem[] = [];

  ngOnInit(): void {
    this._navigationService.level2 = Level2Menu.INTEGRATION;
    const activatedRouteSubscription = this._activatedRoute.params
      .pipe(
        switchMap((params) => {
          const { nodeId, cameraId } = params;
          this._nodeId = nodeId;
          this._deviceId = parseInt(cameraId);
          this.data = [];
          this.sources = [];
          this.rules = [];
          return zip([
            this._ruleService.findAll(this._nodeId, cameraId),
            this._presetService.findAll(this._nodeId, cameraId),
            this._scheduleService.findAll(this._nodeId, cameraId),
          ]);
        }),
        switchMap((responses) => {
          const [
            findAllRuleResponse,
            findAllPresetResponse,
            findAllScheduleResponse,
          ] = responses;

          const presets = findAllPresetResponse.data;
          const schedules = findAllScheduleResponse.data;
          this.rules = findAllRuleResponse.data.map((rule) => {
            const presetName =
              presets.find((e) => e.id === rule.preset_id)?.name || '';
            const scheduleName =
              schedules.find((e) => e.id === rule.schedule_id)?.name || '';
            return new EventSourceRowItem(rule, presetName, scheduleName);
          });

          return this._milestoneService.findAll();
        }),
        switchMap(({ data }) => {
          // if (!response.success) {
          //   throw Error(
          //     `Fetch milestone server list failed with error ${response.message}`
          //   );
          // }

          this.sources = data.map((e) => ({
            value: e.id,
            label: e.name,
          }));

          return this._integrationService.findAll(this._nodeId, this._deviceId);
        })
        // switchMap((response) => {
        // if (!response.success) {
        //   throw Error(
        //     `Fetch integration list failed with error ${response.message}`
        //   );
        // }

        //   return of(response.data);
        // })
      )
      .subscribe({
        next: ({ data }) => {
          this.data = data.map((e) => {
            const rowItem = new RowItemModel();
            rowItem.setData(
              e,
              this.types[0],
              this.sources.find((src) => src.value === e.milestone_id)
            );
            return rowItem;
          });
        },
        error: ({ message }) => this._toastService.showError(message),
      });
    this._subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  add() {
    const rowItem = new RowItemModel();
    rowItem.isExpanded = rowItem.isEditable = rowItem.isNew = true;
    this.data.push(rowItem);
  }

  edit(row: RowItemModel) {
    row.form.enable();
    row.isEditable = true;
  }

  save(row: RowItemModel) {
    const data: Omit<Integration, 'id'> = {
      service_name: row.name,
      milestone_id: row.source?.value,
      guid: row.guid,
      is_send_snapshot: row.isSendSnapshot,
      rule_ids: row.ruleIdList,
    };

    if (row.isNew) {
      this._integrationService
        .create(this._nodeId, this._deviceId, data)
        .subscribe({
          next: (response) => {
            row.id = response.data;
            row.isNew = false;
            this.cancel(row);
            this._toastService.showSuccess('Create integration successfully');
          },
          error: (err: HttpErrorResponse) => {
            const message = err.status > 0 ? err.error?.message : err.message;
            this._toastService.showError(message);
          },
        });
    } else {
      this._integrationService
        .update(this._nodeId, this._deviceId, row.id as number, data)
        .subscribe({
          complete: () => {
            this.cancel(row);
            this._toastService.showSuccess('Update integration successfully');
          },
          error: (err: HttpErrorResponse) => {
            const message = err.status > 0 ? err.error?.message : err.message;
            this._toastService.showError(message);
          },
        });
    }
  }

  cancel(row: RowItemModel) {
    if (row.isNew) {
      this.data = this.data.filter((e) => e.id !== row.id);
      return;
    }

    row.form.disable();
    row.isEditable = false;
  }

  remove(row: RowItemModel) {
    const func = (id: string | number) => {
      this.data = this.data.filter((e) => e.id !== id);
      this._toastService.showSuccess('Delete the integration successfully');
    };

    if (row.isNew) {
      func(row.id);
      return;
    }

    this._integrationService
      .delete(this._nodeId, this._deviceId, row.id! as number)
      .subscribe({
        error: (err: HttpErrorResponse) => {
          const message = err.status > 0 ? err.error?.message : err.message;
          this._toastService.showError(message);
        },
        complete: () => func(row.id),
      });
  }

  onEventSourceClick(item: RowItemModel) {
    const modalRef = this._modalService.open(EventSourceComponent, {
      size: 'xl',
      centered: true,
    });
    const component = modalRef.componentInstance as EventSourceComponent;
    component.data = this.rules;
    modalRef.result
      .then(
        (rules: EventSourceRowItem[]) =>
          (item.ruleIdList = rules.map((e) => e.rule.id))
      )
      .catch(() => {});
  }
}
