import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import * as moment from 'moment';
import 'chartjs-adapter-moment';
import { NodeService } from 'src/app/data/service/node.service';
import { ActivatedRoute } from '@angular/router';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  Subscription,
  catchError,
  filter,
  finalize,
  of,
  skip,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';
import { SearchService } from 'src/app/data/service/search.service';
import { DeviceService } from 'src/app/data/service/device.service';

interface DoughnutChart {
  label: string;
  data: ChartConfiguration<'doughnut'>['data'] & {
    value: number;
    unit: string;
  };
}

@Component({
  selector: 'app-node-dashboard',
  templateUrl: 'node-dashboard.component.html',
  styleUrls: ['node-dashboard.component.scss'],
})
export class NodeDashboardComponent implements OnInit, OnDestroy {
  doughnutChartPlugins: ChartConfiguration<'doughnut'>['plugins'] = [
    {
      id: 'gaugeNeedle',
      afterDatasetsDraw: function (chart, args, options) {
        const { ctx, data, legend } = chart;

        const { value, unit } = data as any;

        let s = 0;
        let backgroundColor = '';
        for (let i = 0; i < data.datasets[0].data.length; i++) {
          s += data.datasets[0].data[i];
          if (value < s) {
            backgroundColor = legend!.legendItems![i].fillStyle!.toString();
            break;
          }
        }

        ctx.save();

        const {
          x: xCenter,
          y: yCenter,
          outerRadius,
        } = chart.getDatasetMeta(0).data[0] as any;
        const r = outerRadius;
        const startAngle = 0.9 * Math.PI;

        ctx.beginPath();

        ctx.arc(xCenter, yCenter, 0.6 * r, startAngle, 0.1 * Math.PI);
        ctx.lineWidth = r * 0.35;
        ctx.strokeStyle = '#7f7f7f7f';
        ctx.stroke();

        const maxValue = data.datasets[0].data.reduce((s, e) => s + e, 0);
        let endAngle = 0.9 + 1.2 * (value / maxValue);
        if (endAngle > 2) {
          endAngle -= 2;
        }
        ctx.beginPath();
        ctx.arc(xCenter, yCenter, 0.6 * r, startAngle, endAngle * Math.PI);
        ctx.lineWidth = r * 0.35;
        ctx.strokeStyle = backgroundColor;
        ctx.stroke();

        ctx.font = `bold ${0.25 * r}px Arial`;
        ctx.fillStyle = backgroundColor;
        ctx.textAlign = 'center';
        ctx.fillText(`${value} ${unit}`, xCenter, yCenter, 0.6 * r);
      },
    },
  ];
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    animation: false,
    circumference: 216,
    rotation: 252,
    cutout: '90%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };
  doughnutCharts: DoughnutChart[] = [
    {
      label: 'CPU',
      data: {
        labels: ['good', 'warning', 'alert'],
        datasets: [
          {
            data: [80, 15, 5],
            backgroundColor: ['green', 'orange', 'red'],
          },
        ],
        value: 0,
        unit: '%',
      },
    },
    {
      label: 'RAM',
      data: {
        labels: ['good', 'warning', 'alert'],
        datasets: [
          {
            data: [70, 15, 15],
            backgroundColor: ['green', 'orange', 'red'],
          },
        ],
        value: 0,
        unit: '%',
      },
    },
    {
      label: 'GPU',
      data: {
        labels: ['good', 'warning', 'alert'],
        datasets: [
          {
            data: [15, 15, 70],
            backgroundColor: ['green', 'orange', 'red'],
          },
        ],
        value: 0,
        unit: '%',
      },
    },
    {
      label: 'Lưu trữ',
      data: {
        labels: ['good', 'warning', 'alert'],
        datasets: [
          {
            data: [70, 15, 15],
            backgroundColor: ['green', 'orange', 'red'],
          },
        ],
        value: 0,
        unit: '%',
      },
    },
  ];

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    animation: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
        },
      },

      title: {
        display: true,
        text: 'Sức khỏe thiết bị theo thời gian',
        position: 'top',
        color: 'white',
      },
    },
  };
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Hoạt động', 'Mất kết nối', 'Lỗi'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['green', 'lightgrey', 'red'],
      },
    ],
  };

  get cpu(): number {
    return this.doughnutCharts[0].data.value;
  }

  set cpu(value: number) {
    this.doughnutCharts[0].data = Object.assign(
      {},
      this.doughnutCharts[0].data,
      { value }
    );
  }

  get ram(): number {
    return this.doughnutCharts[1].data.value;
  }

  set ram(value: number) {
    this.doughnutCharts[1].data = Object.assign(
      {},
      this.doughnutCharts[1].data,
      { value }
    );
  }

  get gpu(): number {
    return this.doughnutCharts[2].data.value;
  }

  set gpu(value: number) {
    this.doughnutCharts[2].data = Object.assign(
      {},
      this.doughnutCharts[2].data,
      { value }
    );
  }

  get storage(): number {
    return this.doughnutCharts[3].data.value;
  }

  set storage(value: number) {
    this.doughnutCharts[3].data = Object.assign(
      {},
      this.doughnutCharts[3].data,
      { value }
    );
  }

  triggerFetchDeviceIds$ = new BehaviorSubject<{ nodeId: string }>({
    nodeId: '',
  });
  deviceIds$ = this.triggerFetchDeviceIds$.pipe(
    filter(({ nodeId }) => nodeId !== ''),
    switchMap(({ nodeId }) => {
      return this.deviceService.findAll(nodeId).pipe(
        switchMap(({ data: devices }) => {
          const deviceIds = devices.map((device) => device.id.toString());
          return of(deviceIds);
        })
      );
    })
  );

  private subscriptions: Subscription[] = [];
  private nodeId: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private nodeService: NodeService,
    private deviceService: DeviceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const activatedRouteSubscription = this.activatedRoute.params.subscribe({
      next: ({ nodeId }) => {
        this.initialize(nodeId);

        this.nodeService
          .getNodeHealth(this.nodeId)
          .pipe(
            switchMap(({ data: nodeHealth }) => {
              this.ram = nodeHealth.cpu.memory.percent;
              this.cpu = nodeHealth.cpu.processor.usage;
              this.storage = nodeHealth.cpu.storage.percent;
              this.gpu = Object.values(nodeHealth.gpu)[0].gpu.percent;
              return this.nodeService.getDeviceHealth(this.nodeId);
            }),
            switchMap(({ data: deviceHealth }) => {
              this.pieChartData.datasets[0].data = [
                deviceHealth.online,
                deviceHealth.offline,
                deviceHealth.error,
              ];
              this.pieChartData = Object.assign({}, this.pieChartData);
              return EMPTY;
            }),
            catchError(() => EMPTY)
          )
          .subscribe();
      },
      error: (err: HttpErrorResponse) => {
        this.toastService.showError(err.error?.message ?? err.message);
        return of(false);
      },
    });
    this.subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private initialize(nodeId: string) {
    this.nodeId = nodeId;
    this.triggerFetchDeviceIds$.next({ nodeId });
  }
}
