import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import * as moment from 'moment';
import 'chartjs-adapter-moment';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/data/service/device.service';
import { NEVER, Subscription, filter, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';
import { Device } from 'src/app/data/schema/boho-v2';

@Component({
  selector: 'app-camera-dashboard',
  templateUrl: 'camera-dashboard.component.html',
  styleUrls: ['camera-dashboard.component.scss'],
})
export class CameraDashboardComponent implements OnInit, OnDestroy {
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
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
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'DD T',
        },
      },
    },
  };
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: Array.from({ length: 8 }, (_, index) =>
      moment()
        .subtract(7 - index, 'days')
        .toDate()
    ),

    datasets: [
      {
        data: [1, 2, 3, 5, 3, 4, 10, 1],
      },
    ],
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    animation: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
        },
      },

      title: {
        display: true,
        text: 'Sức khỏe camera theo thời gian',
        position: 'top',
        color: 'white',
      },
    },
  };
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Hoạt động', 'Mất kết nối', 'Lỗi'],
    datasets: [
      {
        data: [70, 18, 2],
        backgroundColor: ['green', 'lightgrey', 'red'],
      },
    ],
  };

  @ViewChild('snapshot') snapshotRef!: ElementRef;

  get snapshotEl() {
    return this.snapshotRef?.nativeElement as HTMLImageElement;
  }

  get address() {
    return this.device?.address;
  }

  private subscriptions: Subscription[] = [];
  private deviceId: string = '';
  private nodeId: string = '';
  private device?: Device;

  constructor(
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const activatedRouteSubscription = this.activatedRoute.params
      .pipe(filter(({ nodeId, cameraId }) => nodeId && cameraId))
      .subscribe(({ nodeId, cameraId }) => {
        this.initialize(nodeId, cameraId);
        this.deviceService
          .find(this.nodeId, this.deviceId)
          .pipe(
            switchMap(({ data: device }) => {
              this.device = device;
              return this.deviceService.snapshot(this.nodeId, this.deviceId);
            }),
            switchMap(({ data: snapshot }) => {
              this.snapshotEl.src = `data:image/${snapshot.format};charset=utf-8;base64,${snapshot.img}`;
              this.snapshotEl.style.aspectRatio = (
                snapshot.size[0] / snapshot.size[1]
              ).toString();
              return NEVER;
            })
          )
          .subscribe({
            error: (err: HttpErrorResponse) => {
              this.toastService.showError(
                `Fetch data failed with error: ${
                  err.error?.message ?? err.message
                }`
              );
              return NEVER;
            },
          });
      });
    this.subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    console.log('here');
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private initialize(nodeId: string, deviceId: string) {
    this.deviceId = deviceId;
    this.nodeId = nodeId;
    if (this.snapshotEl) {
      this.snapshotEl.src = '';
    }
    this.device = undefined;
  }
}
