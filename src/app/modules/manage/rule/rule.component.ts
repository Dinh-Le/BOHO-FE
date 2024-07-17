import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ColumnConfig } from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ActivatedRoute } from '@angular/router';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { ScheduleService } from 'src/app/data/service/schedule.service';
import { Subscription, filter, of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import {
  Objects,
  RuleTypeItemsSource,
  Severities,
  Severity,
} from 'src/app/data/constants';
import { RuleService } from 'src/app/data/service/rule.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NodeService } from 'src/app/data/service/node.service';
import { Schedule } from 'src/app/data/schema/boho-v2/shedule';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { RowItemModel } from './models';
import { ObjectModel, RuleTypeModel } from 'src/app/data/schema/boho-v2';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss', '../shared/my-input.scss'],
})
export class RuleComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class')
  classNames = 'flex-grow-1 d-flex flex-column';

  @ViewChild('objectColumnTemplate', { static: true })
  objectColumnTemplate!: TemplateRef<any>;

  cameraId = '';
  nodeId = '';

  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _scheduleService = inject(ScheduleService);
  private _toastService = inject(ToastService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _ruleService = inject(RuleService);
  private _nodeService = inject(NodeService);

  data: RowItemModel[] = [];
  presets: Preset[] = [];
  _cameraType?: 'Static' | 'PTZ' = 'Static';

  get ruleTypes(): RuleTypeModel[] {
    return RuleTypeItemsSource.filter((rule) =>
      rule.cameraTypes.includes(this._cameraType as any)
    );
  }

  get objects(): ObjectModel[] {
    return Objects;
  }

  get severities(): Severity[] {
    return Severities;
  }

  schedules: Schedule[] = [];

  columns: ColumnConfig[] = [];
  private _subscriptions: Subscription[] = [];

  constructor() {
    this._navigationService.level3 = Level3Menu.RULE;
    this._activatedRoute.params
      .pipe(
        filter(({ nodeId, cameraId }) => nodeId && cameraId),
        switchMap(({ nodeId, cameraId }) => {
          this.cameraId = cameraId;
          this.nodeId = nodeId;
          this.data = [];
          this.presets = [];
          this.schedules = [];
          return this._presetService.findAll(this.nodeId, this.cameraId);
        }),
        switchMap((response) => {
          this.presets = response.data;

          return this._scheduleService.findAll(this.nodeId, this.cameraId);
        }),
        switchMap((response) => {
          this.schedules = response.data;

          return this._ruleService.findAll(this.nodeId, this.cameraId);
        })
      )
      .subscribe({
        next: ({ data: rules }) => {
          this.data = rules.map((e) => {
            const item = new RowItemModel();
            item.setData(e, this.schedules, this.presets);
            return item;
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên quy tắc',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Điểm giám sát',
        prop: 'preset.label',
        sortable: true,
      },
      {
        label: 'Loại quy tắc',
        prop: 'type.label',
        sortable: true,
      },
      {
        label: 'Loại đối tượng',
        prop: 'objects',
        sortable: true,
        contentTemplateRef: this.objectColumnTemplate,
      },
      {
        label: 'Lịch trình',
        prop: 'schedule.label',
        sortable: true,
      },
    ];
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  add(): void {
    const newItem = new RowItemModel();
    const index =
      this.data.filter((it) => /Quy tắc mới \d\d\d/.test(it.name ?? ''))
        .length + 1;
    newItem.form
      .get('name')
      ?.setValue(`Quy tắc mới ${index.toString().padStart(3, '0')}`);
    newItem.isEditable = true;
    newItem.isExpanded = true;
    newItem.isNew = true;
    newItem.form.enable();
    this.data.push(newItem);
  }

  submit(item: RowItemModel) {
    const data = Object.assign({}, item.data, {
      id: undefined,
    });
    if (item.isNew) {
      this._ruleService
        .create(this.nodeId, this.cameraId, data)
        .pipe(
          switchMap((response) =>
            this._nodeService
              .ruleUpdate(this.nodeId)
              .pipe(switchMap(() => of(response)))
          )
        )
        .subscribe({
          next: ({ data: id }) => {
            this._toastService.showSuccess('Create rule successfully');
            item.isNew = false;
            item.isEditable = false;
            item.form.disable();
            item.id = id.toString();
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(err.error?.message ?? err.message),
        });
    } else {
      this._ruleService
        .update(this.nodeId, this.cameraId, parseInt(item.id), data)
        .pipe(switchMap(() => this._nodeService.ruleUpdate(this.nodeId)))
        .subscribe({
          next: () => {
            this._toastService.showSuccess('Update rule successfully');
            item.isEditable = false;
            item.form.disable();
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(err.error?.message ?? err.message),
        });
    }
  }

  edit(item: RowItemModel) {
    item.isEditable = true;
    item.form.enable();
  }

  cancel(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    this._ruleService.find(this.nodeId, this.cameraId, item.id).subscribe({
      next: ({ data }) => {
        item.setData(data, this.schedules, this.presets);
      },
      error: (err: HttpErrorResponse) => {
        this._toastService.showError(err.error.message ?? err.message);
      },
      complete: () => {
        item.isEditable = false;
        item.form.disable();
      },
    });
  }

  remove(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      this._toastService.showSuccess('Delete rule successfully');
      return;
    }

    this._ruleService
      .delete(this.nodeId, this.cameraId, item.id)
      .pipe(switchMap(() => this._nodeService.ruleUpdate(this.nodeId)))
      .subscribe({
        next: () => {
          this.data = this.data.filter((e) => e.id !== item.id);
          this._toastService.showSuccess('Delete rule successfully');
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
  }

  trackById(_: any, { id }: any): any {
    return id;
  }

  trackByValue(_: any, { value }: any): any {
    return value;
  }

  toggleDirection(data: RowItemModel) {
    switch (data.form.controls['direction'].value) {
      case 'left to right':
        data.form.controls['direction'].setValue('right to left');
        break;
      case 'right to left':
        data.form.controls['direction'].setValue('left to right');
        break;
      default:
        data.form.controls['direction'].setValue('left to right');
        break;
    }
  }
}
