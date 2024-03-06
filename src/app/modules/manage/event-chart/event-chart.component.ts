import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import * as moment from 'moment';
import {
  BehaviorSubject,
  Observable,
  tap,
  switchMap,
  finalize,
  of,
  filter,
  catchError,
} from 'rxjs';
import { SearchService } from 'src/app/data/service/search.service';

@Component({
  selector: 'app-event-chart',
  templateUrl: 'event-chart.component.html',
})
export class EventChartComponent implements OnChanges {
  @HostBinding('class') classNames = 'position-relative';
  @Input() deviceIds: any[] = [];

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Số lượng sự kiện',
        position: 'top',
        color: 'white',
      },
      legend: {
        display: false,
      },
    },
    scales: {
      // x: {
      //   type: 'time',
      //   time: {
      //     tooltipFormat: 'DD T',
      //   },
      // },
    },
  };

  timespan: string = '24 hours';
  triggerFetchChartData$ = new BehaviorSubject<{
    timespan?: string;
    deviceIds?: string[];
  }>({});
  isChartLoading$ = new BehaviorSubject<boolean>(false);
  chartData$: Observable<ChartConfiguration<'bar'>['data']>;

  constructor(private searchService: SearchService) {
    this.chartData$ = this.triggerFetchChartData$.pipe(
      filter(({ deviceIds }) => !!deviceIds && deviceIds.length > 0),
      tap(() => this.isChartLoading$.next(true)),
      switchMap(({ timespan }) => {
        const parts = timespan!.split(' ');
        const amount = parseInt(parts[0]);
        const unit = parts[1];
        const endTime = moment().set('second', 0);
        const startTime = endTime.clone().subtract(amount, unit as any);

        const data: {
          [key: string]: number;
        } = {};

        let timeFormat = 'H:mm';
        if (unit == 'hours') {
          timeFormat = 'H:00';
        } else if (unit == 'days') {
          timeFormat = 'DD-MM';
        } else if (unit == 'months') {
          timeFormat = 'MM-YY';
        }

        for (let i = amount; i > 0; i--) {
          const time = endTime
            .clone()
            .subtract(i, unit as any)
            .format(timeFormat);
          data[time] = 0;
        }

        return this.searchService
          .search({
            dis: this.deviceIds ?? [],
            tq: 'custom',
            start: startTime.format('Y-M-D H:m:s'),
            end: endTime.format('Y-M-D H:m:s'),
            p: 1,
            pl: 1000000000,
          })
          .pipe(
            finalize(() => this.isChartLoading$.next(false)),

            switchMap(({ data: { events } }) => {
              events.forEach((event) => {
                // Wed, 06 Mar 2024 13:19:55
                const detectionTime = moment(
                  event.images_info[0].detection_time,
                  'ddd, DD MMM YYYY H:mm:ss'
                ).format(timeFormat);
                data[detectionTime] += 1;
              });

              const chartData: ChartConfiguration<'bar'>['data'] = {
                labels: Object.keys(data),
                datasets: [
                  {
                    data: Object.values(data),
                  },
                ],
              };

              return of(chartData);
            }),
            catchError(() => {
              const chartData: ChartConfiguration<'bar'>['data'] = {
                labels: Object.keys(data),
                datasets: [
                  {
                    data: Object.values(data),
                  },
                ],
              };
              return of(chartData);
            })
          );
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('deviceIds' in changes && changes['deviceIds'].currentValue) {
      this.triggerFetchChartData$.next({
        timespan: this.timespan,
        deviceIds: changes['deviceIds'].currentValue,
      });
    }
  }
}
