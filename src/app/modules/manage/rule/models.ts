import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Point } from '@shared/components/bounding-box-editor/bounding-box-editor.component';
import {
  Severity,
  Severities,
  Objects,
  RuleTypeItemsSource,
  InvalidId,
} from 'src/app/data/constants';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { Rule } from 'src/app/data/schema/boho-v2/rule';
import { Schedule } from 'src/app/data/schema/boho-v2/shedule';
import { v4 } from 'uuid';
import { ExpandableTableRowItemModelBase } from '../expandable-table/expandable-table.component';
import { ObjectModel, RuleTypeModel } from 'src/app/data/schema/boho-v2';
import { Nullable } from '@shared/shared.types';
import { TripwireDirectionType } from 'src/app/data/data.types';
import { notEmptyArrayValidator } from '@app/helpers/custom-form-validators';

export class RuleItemModel extends ExpandableTableRowItemModelBase {
  form = new FormGroup({
    key: new FormControl<string>(v4(), [Validators.required]),
    id: new FormControl<number>(+InvalidId, [Validators.required]),
    name: new FormControl<string>('', [Validators.required]),
    status: new FormControl<boolean>(false, [Validators.required]),
    integration: new FormControl<string>(''),
    preset: new FormControl<Nullable<Preset>>(null, [Validators.required]),
    type: new FormControl<Nullable<RuleTypeModel>>(null, [Validators.required]),
    points: new FormControl<Point[]>([], [notEmptyArrayValidator]),
    severity: new FormControl<Severity>(Severities[0], [Validators.required]),
    schedule: new FormControl<Nullable<Schedule>>(null, [Validators.required]),
    time_stand: new FormControl<number>(5),
    direction: new FormControl<TripwireDirectionType>('left to right'),
    losing_time: new FormControl<number>(5),
    sensitive: new FormControl<number>(5),
    abandon_time: new FormControl<number>(5),
    objects: new FormControl<ObjectModel[]>([]),
    bothDirection: new FormControl<boolean>(false),
  });

  constructor() {
    super();
    this.form.disable();
    this.form.controls.bothDirection.valueChanges.subscribe((value) => {
      if (value) {
        this.form.controls.direction.setValue('both');
      } else {
        this.form.controls.direction.setValue('left to right');
      }
    });
    this.form.get('type')?.valueChanges.subscribe((value) => {
      switch (value?.id) {
        case 'loitering event':
          this.form.controls['time_stand'].setValue(5);
          this.form.controls['time_stand'].setValidators([
            Validators.required,
            Validators.min(5),
            Validators.max(150),
          ]);

          this.form.controls['objects'].setValidators([Validators.required]);

          this.form.controls['losing_time'].clearValidators();
          this.form.controls['sensitive'].clearValidators();
          this.form.controls['abandon_time'].clearValidators();
          this.form.controls['direction'].clearValidators();
          break;
        case 'sabotage event':
          this.form.controls['objects'].setValidators([Validators.required]);

          this.form.controls['time_stand'].clearValidators();
          this.form.controls['losing_time'].clearValidators();
          this.form.controls['sensitive'].clearValidators();
          this.form.controls['abandon_time'].clearValidators();
          this.form.controls['direction'].clearValidators();
          break;
        case 'tripwire event':
          this.form.controls.bothDirection.setValue(false);
          this.form.controls.direction.setValue('left to right');

          this.form.controls['objects'].setValidators([Validators.required]);
          // this.form.controls['direction'].setValue('right to left');
          this.form.controls['direction'].setValidators([Validators.required]);

          this.form.controls['time_stand'].clearValidators();
          this.form.controls['losing_time'].clearValidators();
          this.form.controls['sensitive'].clearValidators();
          this.form.controls['abandon_time'].clearValidators();
          break;
        case 'lost event':
          this.form.controls['losing_time'].setValue(5);
          this.form.controls['losing_time'].setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(30),
          ]);

          this.form.controls['sensitive'].setValue(5);
          this.form.controls['sensitive'].setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(5),
          ]);

          this.form.controls['objects'].setValue([]);
          this.form.controls['objects'].clearValidators();
          this.form.controls['time_stand'].clearValidators();
          this.form.controls['abandon_time'].clearValidators();
          this.form.controls['direction'].clearValidators();
          break;
        case 'abandon event':
          this.form.controls['sensitive'].setValue(5);
          this.form.controls['sensitive'].setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(5),
          ]);

          this.form.controls['abandon_time'].setValue(5);
          this.form.controls['abandon_time'].setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(30),
          ]);

          this.form.controls['time_stand'].clearValidators();
          this.form.controls['objects'].setValue([]);
          this.form.controls['objects'].clearValidators();
          this.form.controls['losing_time'].clearValidators();
          this.form.controls['direction'].clearValidators();
          break;
        default:
          break;
      }
    });
  }

  get key(): string {
    return this.form.controls.key.value!;
  }

  get id(): number {
    return this.form.controls.id.value!;
  }

  set id(value: number) {
    this.form.controls.id.setValue(value);
  }

  get name(): Nullable<string> {
    return this.form.controls['name'].value;
  }

  get status(): Nullable<boolean> {
    return this.form.controls['status'].value;
  }

  get integration() {
    return this.form.get('integrationName')?.value;
  }

  get preset(): Nullable<Preset> {
    return this.form.controls['preset'].value;
  }

  get type(): Nullable<RuleTypeModel> {
    return this.form.controls['type'].value;
  }

  get objectsVisible() {
    return !['lost', 'abandon'].includes(this.type?.id.split(' ')[0] ?? '');
  }

  get objects(): ObjectModel[] {
    return this.form.controls['objects'].value || [];
  }

  get timeStandVisible() {
    return this.type?.id == 'loitering event';
  }

  get time_stand(): Nullable<number> {
    return this.form.controls['time_stand'].value;
  }

  get boundingBoxType(): 'line' | 'polygon' {
    return this.type?.id === 'tripwire event' ? 'line' : 'polygon';
  }

  get points(): Point[] {
    return this.form.controls['points'].value || [];
  }

  get losingTimeVisible(): boolean {
    return this.type?.id === 'lost event';
  }

  get losing_time(): Nullable<number> {
    return this.form.controls['losing_time'].value;
  }

  get abandonTimeVisible(): boolean {
    return this.type?.id === 'abandon event';
  }

  get abandon_time(): Nullable<number> {
    return this.form.controls['abandon_time'].value;
  }

  get sensitiveVisible(): boolean {
    return ['lost', 'abandon'].includes(this.type?.id.split(' ')[0] ?? '');
  }

  get sensitive(): Nullable<number> {
    return this.form.controls['sensitive'].value;
  }

  get severity(): Nullable<Severity> {
    return this.form.controls['severity'].value;
  }

  get schedule(): Nullable<Schedule> {
    return this.form.controls['schedule'].value;
  }

  get directionSelectionVisible(): boolean {
    return this.form.controls.type.value?.id === 'tripwire event';
  }

  get direction(): Nullable<TripwireDirectionType> {
    return this.form.controls['direction'].value;
  }

  get canSubmit() {
    return this.form.valid;
  }

  get data(): Omit<Rule, 'id'> {
    const rule: Omit<Rule, 'id'> = {
      active: this.status!,
      name: this.name!,
      level: this.severity!.id,
      objects: this.objects.map((e) => e.id),
      combine_name: '',
      alarm_type: this.type?.id ?? '',
      preset_id: this.preset!.id,
      schedule_id: this.schedule!.id,
      points: this.points.map((e) => [e.x, e.y]),
      alarm_metadata: {},
    };

    switch (this.type?.id) {
      case 'loitering event':
        rule.alarm_metadata = {
          loitering: {
            time_stand: this.time_stand!,
          },
        };
        break;
      case 'sabotage event':
      case 'trespassing event':
        break;
      case 'tripwire event':
        rule.alarm_metadata = {
          tripwire: {
            direction:
              this.form.controls.direction.value == 'both'
                ? ['left to right', 'right to left']
                : [this.form.controls.direction.value!],
          },
        };
        break;
      case 'lost event':
        rule.alarm_metadata = {
          lost: {
            losing_time: this.form.controls['losing_time'].value!,
            sensitive: this.form.controls['sensitive'].value!,
          },
        };
        break;
      case 'abandon event':
        rule.alarm_metadata = {
          abandon: {
            abandon_time: this.form.controls['abandon_time'].value!,
            sensitive: this.form.controls['sensitive'].value!,
          },
        };
        break;
      default:
        break;
    }

    return rule;
  }

  setData(rule: Rule, schedules: Schedule[], preset: Preset) {
    this.form.patchValue(
      {
        id: rule.id,
        name: rule.name,
        time_stand: rule.alarm_metadata.loitering?.time_stand ?? 5,
        objects: Objects.filter((e) => rule.objects.includes(e.id)),
        points: rule.points.map((e) => ({
          x: e[0],
          y: e[1],
        })),
        preset: preset,
        schedule: schedules.find((e) => e.id === rule.schedule_id),
        severity: Severities.find((e) => rule.level === e.id),
        status: rule.active,
        type: RuleTypeItemsSource.find((e) => e.id === rule.alarm_type),
        losing_time: rule.alarm_metadata.loitering?.time_stand,
        abandon_time: rule.alarm_metadata.abandon?.abandon_time,
        direction:
          (rule.alarm_metadata.tripwire?.direction.length ?? 1) > 1
            ? 'both'
            : rule.alarm_metadata.tripwire?.direction[0] ?? 'left to right',
        sensitive:
          rule.alarm_metadata.lost?.sensitive ??
          rule.alarm_metadata.abandon?.sensitive,
      },
      {
        emitEvent: false,
      }
    );
  }
}
