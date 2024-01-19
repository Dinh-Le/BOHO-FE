import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { MenuItem } from '../menu-item';
import {
  ColumnConfig,
  ExpandableTableRowItemModelBase,
} from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ActivatedRoute } from '@angular/router';
import { v4 } from 'uuid';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PresetService } from 'src/app/data/service/preset.service';
import { ScheduleService } from 'src/app/data/service/schedule.service';
import { concatMap, finalize, of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import { Objects, RuleTypes, Severities } from 'src/app/data/constants';
import { Point } from '@shared/components/bounding-box-editor/bounding-box-editor.component';
import { Rule } from 'src/app/data/schema/boho-v2/rule';
import { RuleService } from 'src/app/data/service/rule.service';
import { HttpErrorResponse } from '@angular/common/http';

declare interface CustomSelectItemModel extends SelectItemModel {
  data: any;
}

export class RowItemModel extends ExpandableTableRowItemModelBase {
  id = v4();
  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    status: new FormControl<boolean>(true, [Validators.required]),
    integration: new FormControl<string>(''),
    preset: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    type: new FormControl<CustomSelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    points: new FormControl<Point[]>([]),
    objects: new FormControl<SelectItemModel[]>([], [Validators.required]),
    exceedingTime: new FormControl<number>(5, [Validators.required]),
    severity: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    schedule: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
  });

  constructor() {
    super();
    this.form.disable();
  }

  get name() {
    return this.form.get('name')?.value || '';
  }

  get status() {
    return this.form.get('status')?.value || false;
  }

  get integration() {
    return this.form.get('integrationName')?.value;
  }

  get preset() {
    return this.form.get('preset')?.value;
  }

  get type(): CustomSelectItemModel | null | undefined {
    return this.form.get('type')?.value;
  }

  get objects() {
    return this.form.get('objects')?.value;
  }

  get exceedingTime() {
    return this.form.get('exceedingTime')?.value;
  }

  get severity() {
    return this.form.get('severity')?.value;
  }

  get schedule() {
    return this.form.get('schedule')?.value;
  }

  get canSubmit() {
    return this.form.valid;
  }

  get boundingBoxType() {
    if (!this.type) {
      return 'polygon';
    }

    const id = this.type.data.id;
    if (id && id.includes('tripwire')) {
      return 'line';
    } else {
      return 'polygon';
    }
  }

  get points(): Point[] {
    return this.form.get('points')?.value || [];
  }

  get data(): Rule {
    const [alarm_type, direction] = (this.type?.data.id as string)
      .split(',')
      .map((e) => e.trim());

    const rule: Rule = {
      id: this.isNew ? -1 : parseInt(this.id),
      active: this.status!,
      name: this.name!,
      level: this.severity?.value!,
      objects: this.objects!.map((e) => e.value),
      combine_name: '',
      alarm_type: alarm_type,
      preset_id: this.preset?.value!,
      schedule_id: this.schedule?.value!,
      points: this.points.map((e) => [e.x, e.y]),
      alarm_metadata: {},
    };

    if (alarm_type === 'loitering event') {
      rule.alarm_metadata.loitering = {
        time_stand: this.exceedingTime!.toString(),
      };
    } else if (alarm_type === 'tripwire event') {
      rule.alarm_metadata.tripwire = {
        direction: direction,
      };
    }

    return rule;
  }

  setData(
    rule: Rule,
    schedules: SelectItemModel[],
    presets: SelectItemModel[]
  ) {
    this.id = rule.id.toString();
    const severityIndex = Severities.findIndex((e) => e.id === rule.level);
    const typeIndex = RuleTypes.findIndex((e) =>
      e.id.startsWith(rule.alarm_type)
    );
    const objects = Objects.filter((e) => rule.objects.includes(e.id)).map(
      (e) => ({
        value: e.id,
        label: e.name,
        icon: e.icon,
      })
    );
    this.form.reset({
      name: rule.name,
      exceedingTime: parseInt(rule.alarm_metadata.loitering?.time_stand || '5'),
      integration: '',
      objects: objects,
      points: rule.points.map((e) => ({
        x: e[0],
        y: e[1],
      })),
      preset: presets.find((e) => e.value === rule.preset_id),
      schedule: schedules.find((e) => e.value === rule.schedule_id),
      severity: {
        value: Severities[severityIndex].id,
        label: Severities[severityIndex].name,
      },
      status: rule.active,
      type: {
        value: typeIndex,
        label: RuleTypes[typeIndex].name,
        data: RuleTypes[typeIndex],
      },
    });
  }
}

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss', '../shared/my-input.scss'],
})
export class RuleComponent implements OnInit, AfterViewInit {
  @ViewChild('objectColumnTemplate', { static: true })
  objectColumnTemplate!: TemplateRef<any>;

  cameraId = '';
  nodeId = '';
  _activatedRoute = inject(ActivatedRoute);
  _navigationService = inject(NavigationService);
  _presetService = inject(PresetService);
  _scheduleService = inject(ScheduleService);
  _toastService = inject(ToastService);
  _changeDetectorRef = inject(ChangeDetectorRef);
  _ruleService = inject(RuleService);

  menuItems: MenuItem[] = [
    {
      icon: 'bi-plus',
      title: 'Thêm',
      onclick: this.add.bind(this),
    },
  ];
  data: RowItemModel[] = [];
  presets: SelectItemModel[] = [];
  ruleTypes: CustomSelectItemModel[] = RuleTypes.map((e, index) => ({
    value: index,
    label: e.name,
    data: e,
  }));
  objects: SelectItemModel[] = Objects.map((e) => ({
    value: e.id,
    label: e.name,
    icon: e.icon,
  }));
  severities: SelectItemModel[] = Severities.map((e) => ({
    value: e.id,
    label: e.name,
  }));
  schedules: SelectItemModel[] = [];
  columns: ColumnConfig[] = [];

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.RULE;
    this._activatedRoute.params.subscribe(({ nodeId, cameraId }) => {
      this.cameraId = cameraId;
      this.nodeId = nodeId;

      this._presetService
        .findAll(this.nodeId, this.cameraId)
        .pipe(
          concatMap((response) => {
            if (!response.success) {
              throw Error(
                `Fetch the preset list failed with error: ${response.message}`
              );
            }

            this.presets = response.data.map((e) => ({
              label: e.name,
              value: e.id,
            }));

            return this._scheduleService.findAll(this.nodeId, this.cameraId);
          }),
          concatMap((response) => {
            if (!response.success) {
              throw Error(
                `Fetch the schedule list failed with error: ${response.message}`
              );
            }

            this.schedules = response.data.map((e) => ({
              label: e.name,
              value: e.id,
            }));

            return this._ruleService.findAll(this.nodeId, this.cameraId);
          })
        )
        .subscribe({
          next: (response) => {
            this.data = response.data.map((e) => {
              const item = new RowItemModel();
              item.setData(e, this.schedules, this.presets);
              return item;
            });
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    });
  }

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

  add() {
    const newItem = new RowItemModel();
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
          switchMap((response) => {
            if (!response.success) {
              throw Error(`Create rule failed with error: ${response.message}`);
            }

            return of(response);
          })
        )
        .subscribe({
          next: (response) => {
            this._toastService.showSuccess('Create rule successfully');
            item.isNew = false;
            item.isEditable = false;
            item.form.disable();
            item.id = response.data.toString();
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } else {
      this._ruleService
        .update(this.nodeId, this.cameraId, parseInt(item.id), data)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(`Update rule failed with error: ${response.message}`);
            }

            return of(response);
          })
        )
        .subscribe({
          next: () => {
            this._toastService.showSuccess('Update rule successfully');
            item.isEditable = false;
            item.form.disable();
          },
          error: ({ message }) => this._toastService.showError(message),
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
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Delete rule failed with error: ${response.message}`);
          }

          return of(response);
        })
      )
      .subscribe({
        next: () => {
          this.data = this.data.filter((e) => e.id !== item.id);
          this._toastService.showSuccess('Delete rule successfully');
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  get scheduleUrl() {
    return `/manage/device-rule/node/${this.nodeId}/camera/${this.cameraId}/schedule`;
  }
}
