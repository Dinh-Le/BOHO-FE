import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { map, mergeAll, of, switchMap, zip } from 'rxjs';
import { DaysInWeek } from 'src/app/data/constants';
import { Patrol } from 'src/app/data/schema/boho-v2/patrol';
import { PatrolSchedule } from 'src/app/data/schema/boho-v2/patrol-schedule';
import { Touring } from 'src/app/data/schema/boho-v2/touring';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PatrolScheduleService } from 'src/app/data/service/patrol-schedule.service';
import { PatrolService } from 'src/app/data/service/patrol.service';
import { TouringService } from 'src/app/data/service/touring.service';
import { v4 } from 'uuid';

interface PtzTour {
  id: string;
  touringId: number;
  patrolId: number;
  patrolScheduleId: number;
  startTime: number;
  endTime: number;
  left: number;
  width: number;
  day: SelectItemModel;
  color: SelectItemModel;
  selected: boolean;
}

@Component({
  selector: 'app-tour-settings',
  templateUrl: 'tour-settings.component.html',
  styleUrls: ['tour-settings.component.scss', '../../shared/my-input.scss'],
})
export class TourSettingsComponent implements OnInit {
  private _patrolService = inject(PatrolService);
  private _patrolScheduleService = inject(PatrolScheduleService);
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
    let tours: { [key: number]: Touring } = [];
    let patrols: Patrol[] = [];
    let patrolSchedules: PatrolSchedule[] = [];

    this._navigationService.level3 = Level3Menu.TOUR_SETTINGS;

    this._activatedRoute.parent?.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this._nodeId = nodeId;
          this._cameraId = cameraId;

          tours = {};
          patrols = [];
          patrolSchedules = [];

          this.patrols = [];
          this.data = this.data.map(() => []);
          this.form.reset();
          return zip(
            this._patrolService.findAll(this._nodeId, this._cameraId),
            this._tourService.findAll(this._nodeId, this._cameraId)
          );
        }),
        switchMap((responses) => {
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
            patrols = findAllPatrolResponse.data;
          }

          if ('data' in findAllTourResponse) {
            tours = findAllTourResponse.data.reduce(
              (dict, e) => Object.assign(dict, { [e.id]: e }),
              {}
            );
          }

          return patrols.map((e) =>
            this._patrolScheduleService.findAll(
              this._nodeId,
              this._cameraId,
              e.id
            )
          );
        }),
        mergeAll(),
        map((response) => {
          if (!response.success) {
            throw Error('Fetch patrol failed with error: ' + response.data);
          }

          if ('data' in response) {
            patrolSchedules.push(...response.data);
          }
        })
      )
      .subscribe({
        next: () => {
          console.log(patrolSchedules);
          console.log(tours);
          console.log(patrols);

          this.patrols = patrols.map((e) => ({
            value: e.id,
            label: e.name,
          }));

          this.data = patrolSchedules.reduce((data, e) => {
            const startTime = e.schedule.start_time;
            const endTime = e.schedule.end_time;
            const left = (startTime * 100) / 1440;
            const width = ((endTime - startTime) * 100) / 1440;

            data[e.schedule.day].push({
              color: this.colors.find((x) => x.value === e.color)!,
              day: {
                value: e.schedule.day,
                label: DaysInWeek[e.schedule.day],
              },
              startTime,
              endTime,
              id: v4(),
              patrolId: 0,
              patrolScheduleId: e.id,
              touringId: e.touring_id,
              left,
              width,
              selected: false,
            });
            return data;
          }, this.data);
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
      })
      .pipe(
        switchMap((respone) => {
          if (!respone.success) {
            throw Error('Create tour failed with error: ' + respone.message);
          }

          const touringId = respone.data.id;
          return this._patrolScheduleService
            .create(this._nodeId, this._cameraId, patrol.value, {
              color: color.value,
              touring_id: touringId,
              schedule: {
                day: day.value,
                start_time: startTime,
                end_time: endTime,
              },
            })
            .pipe(
              switchMap((response) => {
                if (!response.success) {
                  throw Error(
                    'Create patrol schedule failed with error: ' +
                      response.message
                  );
                }

                const patrolScheduleId = respone.data.id;
                return of({
                  touringId,
                  patrolScheduleId,
                });
              })
            );
        })
      )
      .subscribe({
        next: ({ touringId, patrolScheduleId }) => {
          const left = (startTime * 100) / 1440;
          const width = ((endTime - startTime) * 100) / 1440;
          const tour: PtzTour = {
            id: v4(),
            touringId,
            patrolScheduleId,
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

    this._patrolScheduleService
      .delete(
        this._nodeId,
        this._cameraId,
        this.selectedTour.patrolId,
        this.selectedTour.patrolScheduleId
      )
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              'Delete patrol schedule failed with error: ' + response.message
            );
          }

          return this._tourService.delete(
            this._nodeId,
            this._cameraId,
            this.selectedTour!.touringId
          );
        })
      )
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
