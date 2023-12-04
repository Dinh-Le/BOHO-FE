import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { switchMap, zip } from 'rxjs';
import { DaysInWeek } from 'src/app/data/constants';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PatrolService } from 'src/app/data/service/patrol.service';
import { TouringService } from 'src/app/data/service/touring.service';
import { v4 } from 'uuid';

interface PtzTour {
  id: string;
  touringId: number;
  patrolId: string;
  startTime: number;
  endTime: number;
  left: number;
  width: number;
  day: SelectItemModel;
  color: SelectItemModel;
  selected?: boolean;
}

@Component({
  selector: 'app-tour-settings',
  templateUrl: 'tour-settings.component.html',
  styleUrls: ['tour-settings.component.scss', '../../shared/my-input.scss'],
})
export class TourSettingsComponent implements OnInit {
  private _patrolService = inject(PatrolService);
  private _tourService = inject(TouringService);
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _navigationService = inject(NavigationService);
  private _nodeId: string = '';
  private _cameraId: string = '';

  patrols: SelectItemModel[] = [];
  colors: SelectItemModel[] = [
    {
      value: 'green',
      label: 'Xanh lá',
    },
    {
      value: 'magenta',
      label: 'Cánh xen',
    },
    {
      value: 'cyan',
      label: 'Xanh lơ',
    },
    {
      value: 'purple',
      label: 'Tím',
    },
    {
      value: 'orange',
      label: 'Cam',
    },
  ];
  daysInWeek: SelectItemModel[] = DaysInWeek.map((e, index) => ({
    value: index,
    label: e,
  }));
  hoursInDay: number[] = Array(24)
    .fill(0)
    .map((_, index) => index);
  data: PtzTour[][] = Array(DaysInWeek.length)
    .fill(0)
    .map(() => []);
  form: FormGroup = new FormGroup({
    startTime: new FormControl(0),
    endTime: new FormControl(0),
    day: new FormControl(null, [Validators.required]),
    type: new FormControl('patrol'),
    patrol: new FormControl(null, [Validators.required]),
    color: new FormControl(null, [Validators.required]),
  });
  selectedTour: PtzTour | undefined;

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.TOUR_SETTINGS;

    this._activatedRoute.parent?.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this._nodeId = nodeId;
          this._cameraId = cameraId;

          this.patrols = [];
          this.data = this.data.map(() => []);
          this.form.reset(
            {
              startTime: 0,
              endTime: 0,
              day: null,
              type: 'patrol',
              color: null,
            },
            {
              emitEvent: true,
            }
          );
          return zip(
            this._patrolService.findAll(this._nodeId, this._cameraId),
            this._tourService.findAll(this._nodeId, this._cameraId)
          );
        })
      )
      .subscribe({
        next: (responses) => {
          const [findAllPatrolResponse, findAllTourResponse] = responses;

          if (!findAllPatrolResponse.success) {
            throw Error(
              'Fetch patrol data failed with error: ' +
                findAllPatrolResponse.message
            );
          }

          if (!findAllTourResponse.success) {
            throw Error(
              'Fetch tour data failed with error: ' +
                findAllTourResponse.message
            );
          }

          if ('data' in findAllPatrolResponse) {
            this.patrols = findAllPatrolResponse.data.map((e) => ({
              value: e.id,
              label: e.name,
            }));
          }

          if ('data' in findAllTourResponse) {
            findAllTourResponse.data.forEach((e) => {
              const startTime = parseInt(e.schedule.start_time);
              const endTime = parseInt(e.schedule.end_time);
              const left = (startTime * 100) / 1440;
              const width = ((endTime - startTime) * 100) / 1440;
              const day = parseInt(e.schedule.day);

              this.data[day].push({
                color: this.colors.find((x) => x.value === e.color)!,
                day: {
                  value: day,
                  label: DaysInWeek[day],
                },
                startTime,
                endTime,
                id: v4(),
                touringId: e.id,
                patrolId: e.patrol_id!,
                left,
                width,
                selected: false,
              });
            });
          }
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  submit() {
    const { startTime, endTime, color, day, patrol, type } = this.form.value;
    if (startTime >= endTime) {
      this._toastService.showError(
        'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc'
      );
      return;
    }

    this._tourService
      .create(this._nodeId, this._nodeId, {
        active: true,
        type,
        color: color.value,
        patrol_id: patrol.value.toString(),
        schedule: {
          day: day.value.toString(),
          start_time: startTime.toString(),
          end_time: endTime.toString(),
        },
      })
      .subscribe({
        next: (response) => {
          if (!response.success) {
            throw Error(
              'Create touring failed with error: ' + response.message
            );
          }

          const left = (startTime * 100) / 1440;
          const width = ((endTime - startTime) * 100) / 1440;
          const tour: PtzTour = {
            id: v4(),
            touringId: response.data,
            patrolId: patrol.value,
            startTime,
            endTime,
            day,
            color,
            left: left,
            width: width,
            selected: true,
          };
          if (this.selectedTour) {
            this.selectedTour.selected = false;
          }
          this.selectedTour = tour;
          this.data[day.value].push(tour);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  canSubmit() {
    return this.form.valid;
  }

  selectTour(tour: PtzTour) {
    if (this.selectedTour) {
      this.selectedTour.selected = false;
    }

    this.selectedTour = tour;
    this.selectedTour.selected = true;
  }

  deleteSelectedTour() {
    if (!this.selectedTour) {
      return;
    }

    this._tourService
      .delete(this._nodeId, this._cameraId, this.selectedTour!.touringId)
      .subscribe({
        next: (response) => {
          if (!response.success) {
            throw Error(
              'Delete touring failed with error: ' + response.message
            );
          }

          const day = this.selectedTour?.day.value;
          this.data[day] = this.data[day].filter(
            (e) => e.id !== this.selectedTour?.id
          );
          this.selectedTour = undefined;
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  deleteAll() {
    this.selectedTour = undefined;
    this.data = this.data.map(() => []);
  }
}
