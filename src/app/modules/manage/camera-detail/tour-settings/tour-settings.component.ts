import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { from, map, mergeAll, of, switchMap, zipAll } from 'rxjs';
import { DaysInWeek } from 'src/app/data/constants';
import { ColorNames } from 'src/app/data/constants/colors.constant';
import { Patrol } from 'src/app/data/schema/boho-v2/patrol';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PatrolService } from 'src/app/data/service/patrol.service';
import { PresetService } from 'src/app/data/service/preset.service';
import {
  CreateOrUpdateTouringScheduleRequest,
  TouringService,
  UpdateTouringScheduleRequest,
} from 'src/app/data/service/touring.service';
import { v4 } from 'uuid';

interface PtzSchedule {
  id: string;
  patrolId: number;
  scheduleId: number;
  type: 'patrol' | 'preset';
  startTime: number;
  endTime: number;
  left: number;
  width: number;
  day: number;
  color: string;
  selected?: boolean;
}

@Component({
  selector: 'app-tour-settings',
  templateUrl: 'tour-settings.component.html',
  styleUrls: ['tour-settings.component.scss', '../../shared/my-input.scss'],
})
export class TourSettingsComponent implements OnInit {
  private _patrolService = inject(PatrolService);
  private _presetService = inject(PresetService);
  private _tourService = inject(TouringService);
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _navigationService = inject(NavigationService);
  private _nodeId: string = '';
  private _cameraId: string = '';
  private _touringId: number = -1;

  patrols: Patrol[] = [];
  presets: Preset[] = [];
  daysInWeek: SelectItemModel[] = DaysInWeek.map((e, index) => ({
    value: index,
    label: e,
  }));
  hoursInDay: number[] = Array(24)
    .fill(0)
    .map((_, index) => index);
  data: PtzSchedule[][] = Array(DaysInWeek.length)
    .fill(0)
    .map(() => []);
  form: FormGroup = new FormGroup({
    startTime: new FormControl<number>(0, [Validators.required]),
    endTime: new FormControl<number>(0, [Validators.required]),
    day: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
    type: new FormControl<'patrol' | 'preset'>('patrol', [Validators.required]),
    journey: new FormControl<SelectItemModel | undefined>(undefined, [
      Validators.required,
    ]),
  });
  selectedSchedule: PtzSchedule | undefined;

  get journeyList(): SelectItemModel[] {
    const isPatrolType = this.form.get('type')!.value === 'patrol';
    const sources = isPatrolType ? this.patrols : this.presets;
    const offset = isPatrolType ? 0 : this.presets.length;
    const items = sources.map((e, index) => ({
      value: e.id,
      label: e.name,
      color: ColorNames[offset + index],
    }));
    return items;
  }

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.TOUR_SETTINGS;
    this.form.get('type')?.valueChanges.subscribe(() => {
      this.form.get('journey')?.reset({
        value: undefined,
      });
    });

    this._activatedRoute.parent?.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this._nodeId = nodeId;
          this._cameraId = cameraId;
          this._touringId = -1;

          this.patrols = [];
          this.data = this.data.map(() => []);
          this.resetForm();
          return this._patrolService.findAll(this._nodeId, this._cameraId);
        }),
        switchMap(({ data: patrols }) => {
          this.patrols = patrols;
          return this._presetService.findAll(this._nodeId, this._cameraId);
        }),
        switchMap(({ data: presets }) => {
          this.presets = presets;
          return this._tourService.findAll(this._nodeId, this._cameraId);
        })
      )
      .subscribe({
        next: ({ data: tours }) => {
          tours.forEach((e) => {
            this._touringId = e.id;
            e.patrol_setting.forEach((setting) => {
              const { patrol_id, patrol_schedule_id, color } = setting;
              setting.schedule.forEach((schedule) => {
                const startTime = this.fromTimeString(schedule.start_time);
                const endTime = this.fromTimeString(schedule.end_time);
                const left = (startTime * 100) / 1440;
                const width = ((endTime - startTime) * 100) / 1440;
                const day = schedule.day;
                const ptzSchedule: PtzSchedule = {
                  id: v4(),
                  type: 'patrol',
                  patrolId: patrol_id,
                  scheduleId: patrol_schedule_id,
                  startTime,
                  endTime,
                  day,
                  color,
                  left: left,
                  width: width,
                };
                this.data[day].push(ptzSchedule);
              });
            });

            e.preset_setting.forEach((setting) => {
              const { preset_id, color, preset_schedule_id } = setting;
              setting.schedule.forEach((schedule) => {
                const startTime = this.fromTimeString(schedule.start_time);
                const endTime = this.fromTimeString(schedule.end_time);
                const left = (startTime * 100) / 1440;
                const width = ((endTime - startTime) * 100) / 1440;
                const day = schedule.day;
                const ptzSchedule: PtzSchedule = {
                  id: v4(),
                  type: 'preset',
                  patrolId: preset_id,
                  scheduleId: preset_schedule_id,
                  startTime,
                  endTime,
                  day,
                  color,
                  left: left,
                  width: width,
                };
                this.data[day].push(ptzSchedule);
              });
            });
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error.message ?? err.message),
      });
  }

  canAdd() {
    return this.selectedSchedule == undefined && this.form.valid;
  }

  add() {
    const { startTime, endTime, day, journey, type } = this.form.value;
    if (startTime >= endTime) {
      this._toastService.showError(
        'The end time must be greater than the start time'
      );
      return;
    }

    const data: CreateOrUpdateTouringScheduleRequest =
      type === 'patrol'
        ? {
            patrol_setting: {
              color: journey.color,
              patrol_id: journey.value,
              schedule: [
                {
                  start_time: this.toTimeString(startTime),
                  end_time: this.toTimeString(endTime),
                  day: (day as SelectItemModel).value,
                },
              ],
            },
          }
        : {
            preset_setting: {
              color: journey.color,
              preset_id: journey.value,
              schedule: [
                {
                  start_time: this.toTimeString(startTime),
                  end_time: this.toTimeString(endTime),
                  day: (day as SelectItemModel).value,
                },
              ],
            },
          };
    this._tourService
      .createOrUpdateTouringSchedule(
        this._nodeId,
        this._cameraId,
        this._touringId,
        data
      )
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              'Add tour schedule for patrol or preset failed with error: ' +
                response.message
            );
          }
          return of(response);
        })
      )
      .subscribe({
        next: (response) => {
          this._toastService.showSuccess(
            'Create touring schedule successfully'
          );
          const left = (startTime * 100) / 1440;
          const width = ((endTime - startTime) * 100) / 1440;
          const schedule: PtzSchedule = {
            id: v4(),
            type,
            patrolId: journey.value,
            scheduleId: response.data.id,
            startTime,
            endTime,
            day: day.value,
            color: journey.color,
            left: left,
            width: width,
            selected: false,
          };
          this.data[schedule.day].push(schedule);
          this.resetForm();
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  selectSchedule(schedule: PtzSchedule) {
    if (this.selectedSchedule) {
      this.selectedSchedule.selected = false;
    }

    this.selectedSchedule = schedule;
    this.selectedSchedule.selected = true;
    this.form.reset({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      day: this.daysInWeek.find((e) => e.value === schedule.day),
      type: schedule.type,
      journey: {
        value: schedule.patrolId,
      },
    });
  }

  delete() {
    if (!this.selectedSchedule) {
      return;
    }

    const {
      id,
      day,
      scheduleId: patrolScheduleId,
      color,
      type,
    } = this.selectedSchedule;
    const data: UpdateTouringScheduleRequest = {
      color,
      schedule_type: type,
      schedule: this.data
        .flat()
        .filter((e) => e.scheduleId === patrolScheduleId && e.id != id)
        .map((e) => ({
          start_time: this.toTimeString(e.startTime),
          end_time: this.toTimeString(e.endTime),
          day: e.day,
        })),
    };

    const response$ =
      data.schedule.length > 0
        ? this._tourService.updateTouringSchedule(
            this._nodeId,
            this._cameraId,
            this._touringId,
            patrolScheduleId,
            data
          )
        : this._tourService.deleteTouringSchedule(
            this._nodeId,
            this._cameraId,
            this._touringId,
            patrolScheduleId,
            type
          );
    response$
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              'Delete a touring schedule for patrol or preset failed with error: ' +
                response.message
            );
          }
          return of(response);
        })
      )
      .subscribe({
        next: () => {
          this._toastService.showSuccess(
            'Delete a touring schedule successfully'
          );
          this.data[day] = this.data[day].filter((e) => e.id !== id);
          this.resetForm();
          this.selectedSchedule = undefined;
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  deleteAll() {
    const patrolSchedules = this.data.flat().reduce(
      (acc, e) =>
        Object.assign(acc, {
          [e.scheduleId.toString()]: e.type,
        }),
      {} as {
        [key: string]: 'preset' | 'patrol';
      }
    );
    from(Object.entries(patrolSchedules))
      .pipe(
        map(([scheduleId, type]) =>
          this._tourService.deleteTouringSchedule(
            this._nodeId,
            this._cameraId,
            this._touringId,
            parseInt(scheduleId),
            type
          )
        ),
        mergeAll(),
        map((response) => {
          if (!response.success) {
            throw Error(
              `Delete touring schedule failed with error: ${response.message}`
            );
          }

          return of(response);
        }),
        zipAll()
      )
      .subscribe({
        next: () => {
          this._toastService.showSuccess('Delete all successfully');
          this.selectedSchedule = undefined;
          this.data = this.data.map(() => []);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  cancel() {
    if (this.selectedSchedule) {
      this.selectedSchedule.selected = false;
      this.selectedSchedule = undefined;
    }

    this.resetForm();
  }

  get canSave(): boolean {
    return this.selectedSchedule !== undefined && this.form.valid;
  }

  save() {
    const { startTime, endTime, day, type, journey } = this.form.value;
    const left = (startTime * 100) / 1440;
    const width = ((endTime - startTime) * 100) / 1440;
    const { color, value: journeyId } = journey;

    const isJourneyChanged =
      `${this.selectedSchedule?.type}-${this.selectedSchedule?.patrolId}` !==
      `${type}-${journey.value}`;
    const isDayChanged = day.value !== this.selectedSchedule?.day;
    const modifiedSchedule: PtzSchedule = {
      id: isDayChanged ? v4() : this.selectedSchedule!.id,
      patrolId: journeyId,
      scheduleId: isJourneyChanged ? 0 : this.selectedSchedule!.scheduleId,
      type,
      startTime,
      endTime,
      left,
      width,
      day: day.value,
      selected: false,
      color,
    };

    const onComplete = () => {
      this._toastService.showSuccess(
        'Update the touring schedule successfully'
      );

      if (isDayChanged) {
        this.data[this.selectedSchedule!.day] = this.data[
          this.selectedSchedule!.day
        ].filter((e) => e.id !== this.selectedSchedule?.id);
        this.data[modifiedSchedule.day].push(modifiedSchedule);
      } else {
        const index = this.data[modifiedSchedule.day].findIndex(
          (e) => e.id === this.selectedSchedule?.id
        );
        this.data[modifiedSchedule.day][index] = modifiedSchedule;
      }

      this.selectedSchedule = undefined;
      this.resetForm();
    };

    if (isJourneyChanged) {
      this._tourService
        .createOrUpdateTouringSchedule(
          this._nodeId,
          this._cameraId,
          this._touringId,
          type === 'patrol'
            ? {
                patrol_setting: {
                  patrol_id: modifiedSchedule.patrolId,
                  color: modifiedSchedule.color,
                  schedule: [
                    {
                      start_time: this.toTimeString(modifiedSchedule.startTime),
                      end_time: this.toTimeString(modifiedSchedule.endTime),
                      day: modifiedSchedule.day,
                    },
                  ],
                },
              }
            : {
                preset_setting: {
                  preset_id: modifiedSchedule.patrolId,
                  color: modifiedSchedule.color,
                  schedule: [
                    {
                      start_time: this.toTimeString(modifiedSchedule.startTime),
                      end_time: this.toTimeString(modifiedSchedule.endTime),
                      day: modifiedSchedule.day,
                    },
                  ],
                },
              }
        )
        .pipe(
          switchMap((response) => {
            modifiedSchedule.scheduleId = response.data.id;
            const schedules = this.data
              .flat()
              .filter(
                (e) =>
                  e.id !== this.selectedSchedule?.id &&
                  e.scheduleId === this.selectedSchedule?.scheduleId
              );
            if (schedules.length == 0) {
              return this._tourService
                .deleteTouringSchedule(
                  this._nodeId,
                  this._cameraId,
                  this._touringId,
                  this.selectedSchedule!.scheduleId,
                  this.selectedSchedule!.type
                )
                .pipe(switchMap(() => of(true)));
            } else {
              return this._tourService
                .updateTouringSchedule(
                  this._nodeId,
                  this._cameraId,
                  this._touringId,
                  this.selectedSchedule!.scheduleId,
                  {
                    schedule_type: this.selectedSchedule!.type,
                    color: this.selectedSchedule!.color,
                    schedule: schedules.map((e) => ({
                      start_time: this.toTimeString(e.startTime),
                      end_time: this.toTimeString(e.endTime),
                      day: e.day,
                    })),
                  }
                )
                .pipe(switchMap(() => of(true)));
            }
          })
        )
        .subscribe({
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(err.error?.message ?? err.message),
          complete: () => onComplete(),
        });
    } else {
      this._tourService
        .updateTouringSchedule(
          this._nodeId,
          this._cameraId,
          this._touringId,
          modifiedSchedule.scheduleId,
          {
            schedule_type: type,
            color: color,
            schedule: this.data
              .flat()
              .filter(
                (e) =>
                  e.scheduleId === modifiedSchedule.scheduleId &&
                  e.id !== this.selectedSchedule?.id
              )
              .concat(modifiedSchedule)
              .map((e) => ({
                start_time: this.toTimeString(startTime),
                end_time: this.toTimeString(endTime),
                day: e.day,
              })),
          }
        )
        .subscribe({
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(err.error?.message ?? err.message),
          complete: () => onComplete(),
        });
    }
  }

  private resetForm(): void {
    this.form.reset(
      {
        startTime: 0,
        endTime: 0,
        day: undefined,
        type: 'patrol',
        journey: undefined,
        color: undefined,
      },
      {
        emitEvent: true,
      }
    );
  }

  private fromTimeString(s: string): number {
    const parts = s.split(':').map((e) => parseInt(e));
    return parts[0] * 60 + parts[1];
  }

  private toTimeString(value: number): string {
    const hour = Math.floor(value / 60);
    const minute = value % 60;
    return `${hour}:${minute}:0`;
  }
}
