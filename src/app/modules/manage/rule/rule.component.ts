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
import { of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';

export class RowItemModel extends ExpandableTableRowItemModelBase {
  id = v4();
  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    status: new FormControl<boolean>(true, [Validators.required]),
    integration: new FormControl<string>(''),
    preset: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    type: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    objects: new FormControl<SelectItemModel[]>([], [Validators.required]),
    exceedingTime: new FormControl<number>(5, [Validators.required]),
    severity: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    schedule: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
  });

  get name() {
    return this.form.get('name')?.value;
  }

  get status() {
    return this.form.get('status')?.value;
  }

  get integration() {
    return this.form.get('integrationName')?.value;
  }

  get preset() {
    return this.form.get('preset')?.value;
  }

  get type() {
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
    if (this.type?.value === 4 || this.type?.value === 5) {
      return 'line';
    } else {
      return 'polygon';
    }
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

  _cameraId = '';
  _nodeId = '';
  _activatedRoute = inject(ActivatedRoute);
  _navigationService = inject(NavigationService);
  _presetService = inject(PresetService);
  _scheduleService = inject(ScheduleService);
  _toastService = inject(ToastService);
  _changeDetectorRef = inject(ChangeDetectorRef);

  menuItems: MenuItem[] = [
    {
      icon: 'bi-plus',
      title: 'Thêm',
      onclick: this.add.bind(this),
    },
  ];
  data: RowItemModel[] = [];
  presets: SelectItemModel[] = [];
  ruleTypes: SelectItemModel[] = [
    {
      value: 1,
      label: 'Đi vào vùng',
    },
    {
      value: 2,
      label: 'Đi ra khỏi vùng',
    },
    {
      value: 3,
      label: 'Đi luẩn quẩn',
    },
    {
      value: 4,
      label: 'Vượt đường kẻ trái sang phải',
    },
    {
      value: 5,
      label: 'Vượt đường kẻ phải sang trái',
    },
    {
      value: 6,
      label: 'Đối tượng để lại',
    },
  ];
  objects: SelectItemModel[] = [
    {
      value: 1,
      label: 'Người',
      icon: 'walking-person',
    },
    {
      value: 2,
      label: 'Xe đạp',
      icon: 'bicycle',
    },
    {
      value: 3,
      label: 'Xe mô-tô',
      icon: 'motocycle',
    },
    {
      value: 4,
      label: 'Ô tô',
      icon: 'side-car',
    },
    {
      value: 5,
      label: 'Xe bus',
      icon: 'bus-side-view',
    },
    {
      value: 6,
      label: 'Xe tải',
      icon: 'side-truck',
    },
  ];
  severities: SelectItemModel[] = [
    {
      value: 1,
      label: 'Thấp',
    },
    {
      value: 2,
      label: 'Bình thường',
    },
    {
      value: 3,
      label: 'Cao',
    },
  ];
  schedules: SelectItemModel[] = [];
  columns: ColumnConfig[] = [];

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.RULE;
    this._activatedRoute.params.subscribe(({ nodeId, cameraId }) => {
      this._cameraId = cameraId;
      this._nodeId = nodeId;

      this._presetService
        .findAll(this._nodeId, this._cameraId)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Fetch the preset list failed with error: ${response.message}`
              );
            }

            return of(response.data);
          })
        )
        .subscribe({
          next: (presets) => {
            this.presets = presets.map((e) => ({
              label: e.name,
              value: e.id,
            }));
          },
          error: ({ message }) => {
            this._toastService.showError(message);
            this.presets = [];
          },
        });

      this._scheduleService
        .findAll(this._nodeId, this._cameraId)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Fetch the schedule list failed with error: ${response.message}`
              );
            }

            return of(response.data);
          })
        )
        .subscribe({
          next: (schedules) => {
            this.schedules = schedules.map((e) => ({
              label: e.name,
              value: e.id,
            }));
          },
          error: ({ message }) => {
            this._toastService.showError(message);
            this.schedules = [];
          },
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
        prop: 'diemGiamSat.name',
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
        prop: 'schedule.name',
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
    this.data.push(newItem);
  }

  submit(item: RowItemModel) {}

  remove(item: RowItemModel) {
    this.data = this.data.filter((e) => e.id !== item.id);
  }

  get scheduleUrl() {
    return `/manage/device-rule/node/${this._nodeId}/camera/${this._cameraId}/schedule`;
  }
}
