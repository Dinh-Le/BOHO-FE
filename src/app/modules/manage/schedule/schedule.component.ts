import { Component, OnInit, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowItemModelBase,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import {
  CreateOrUpdateScheduleRequest,
  ScheduleService,
} from 'src/app/data/service/schedule.service';
import { of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import { Schedule } from 'src/app/data/schema/boho-v2/shedule';

class RowItemModel extends ExpandableTableRowItemModelBase {
  id = v4();
  name = 'Lịch trình';
  scheduleData: boolean[][] = Array(7)
    .fill(0)
    .map((_) => Array(48).fill(true));

  get data(): Schedule {
    const timeInfo = this.scheduleData.flatMap((schedule, day) => {
      return schedule.reduce(
        (acc, value, i) => {
          if (value) {
            if (acc.length === 0 || acc[acc.length - 1].end_time !== '') {
              acc.push({
                start_time: this.toTimeString(i),
                end_time: '',
                day,
              });
            } else if (
              i === schedule.length - 1 &&
              acc[acc.length - 1].end_time === ''
            ) {
              acc[acc.length - 1].end_time = '24:00';
            } else {
              // Do nothing
            }
          } else {
            if (acc.length > 0 && acc[acc.length - 1].end_time === '') {
              acc[acc.length - 1].end_time = this.toTimeString(i);
            }
          }
          return acc;
        },
        [] as {
          day: number;
          start_time: string;
          end_time: string;
        }[]
      );
    });
    return {
      id: this.isNew ? -1 : parseInt(this.id),
      name: this.name,
      time_info: timeInfo,
    };
  }

  set data({ id, name, time_info }: Schedule) {
    this.id = id.toString();
    this.name = name;
    this.scheduleData = Array(7)
      .fill(0)
      .map((_) => Array(48).fill(false));

    for (const { start_time, end_time, day } of time_info) {
      const startTime = this.fromTimeString(start_time);
      const endTime = this.fromTimeString(end_time);

      for (let i = startTime; i < endTime; i++) {
        this.scheduleData[day][i] = true;
      }
    }
  }

  toTimeString(value: number): string {
    const hour = Math.floor(value / 2);
    const minute = value % 2 === 0 ? 0 : 30;
    return `${hour}:${minute}:0`;
  }

  fromTimeString(s: string): number {
    const parts = s.split(':').map((e) => parseInt(e));
    return Math.min(48, parts[0] * 2 + Math.ceil(parts[1] / 30));
  }
}

@Component({
  selector: 'app-schedule',
  templateUrl: 'schedule.component.html',
  styleUrls: ['../shared/my-input.scss'],
})
export class ScheduleComponent implements OnInit {
  _activatedRoute = inject(ActivatedRoute);
  _scheduleService = inject(ScheduleService);
  _toastService = inject(ToastService);
  _navigationService = inject(NavigationService);
  _nodeId: string | undefined;
  _cameraId: string | undefined;
  daysInWeek: string[] = ['H', 'B', 'T', 'N', 'S', 'B', 'C'];
  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên lịch trình',
      prop: 'name',
    },
  ];

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.SCHEDULE;
    this._activatedRoute.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this._cameraId = cameraId;
          this._nodeId = nodeId;
          this.data = [];
          return this._scheduleService.findAll(this._nodeId!, this._cameraId!);
        }),
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Fetch schedule data failed with error: ${response.message}`
            );
          }

          return of(response);
        })
      )
      .subscribe({
        next: (response) => {
          this.data = response.data.map((e) => {
            const item = new RowItemModel();
            item.data = e;
            return item;
          });
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  add() {
    const item = new RowItemModel();
    item.isEditable = true;
    item.isExpanded = true;
    item.isNew = true;
    this.data.push(item);
  }

  toggle(item: RowItemModel, i: number, j: number) {
    if (!item.isEditable) {
      return;
    }

    item.scheduleData[i][j] = !item.scheduleData[i][j];
  }

  save(item: RowItemModel) {
    const data: CreateOrUpdateScheduleRequest = Object.assign({}, item.data, {
      id: undefined,
    });

    if (item.isNew) {
      this._scheduleService
        .create(this._nodeId!, this._cameraId!, data)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Create schedule failed with error: ${response.message}`
              );
            }

            return of(response);
          })
        )
        .subscribe({
          next: (response) => {
            this._toastService.showSuccess('Create schedule successfully');
            item.id = response.data.toString();
            item.isNew = false;
            item.isEditable = false;
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } else {
      this._scheduleService
        .update(this._nodeId!, this._cameraId!, item.id, data)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Update schedule failed with error: ${response.message}`
              );
            }

            return of(response);
          })
        )
        .subscribe({
          next: () => {
            this._toastService.showSuccess('Update schedule successfully');
            item.isEditable = false;
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    }
  }

  cancel(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    item.isEditable = false;
  }

  remove(item: RowItemModel) {
    this._scheduleService
      .delete(this._nodeId!, this._cameraId!, item.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Delete schedule failed with error: ${response.message}`
            );
          }

          return of(response);
        })
      )
      .subscribe({
        next: () => {
          this.data = this.data.filter((e) => e.id !== item.id);
          this._toastService.showSuccess('Delete schedule successfully');
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  get ruleUrl() {
    return `/manage/device-rule/node/${this._nodeId}/camera/${this._cameraId}/rule`;
  }
}
