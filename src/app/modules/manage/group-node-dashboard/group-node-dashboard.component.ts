import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import * as moment from 'moment';
import 'chartjs-adapter-moment';
import * as Leaflet from 'leaflet';
import { HoChiMinhCoord } from 'src/app/data/constants';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, Subscription, concat, of, switchMap, toArray } from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import { NodeService } from 'src/app/data/service/node.service';
import { Device, NodeOperator } from 'src/app/data/schema/boho-v2';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';
import {
  NodeOperatorService,
  NodeOperatorStatus,
} from 'src/app/data/service/node-operator.service';

@Component({
  selector: 'app-group-node-dashboard',
  templateUrl: 'group-node-dashboard.component.html',
  styleUrls: ['group-node-dashboard.component.scss'],
})
export class GroupNodeDashboardComponent implements OnInit, OnDestroy {
  mapOptions: Leaflet.MapOptions = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
    zoom: 16,
    center: new Leaflet.LatLng(
      parseFloat(HoChiMinhCoord.lat),
      parseFloat(HoChiMinhCoord.long)
    ),
  };

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

  private nodeOperatorId: string = '';
  private devices: Device[] = [];
  private map!: Leaflet.Map;
  private markers: Leaflet.Marker[] = [];
  private subscriptions: Subscription[] = [];

  status!: NodeOperatorStatus;

  constructor(
    private activatedRoute: ActivatedRoute,
    private nodeOperatorService: NodeOperatorService,
    private nodeService: NodeService,
    private deviceService: DeviceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const activatedRouteSubscription = this.activatedRoute.params
      .pipe(
        switchMap(({ nodeOperatorId }) => {
          this.initialize(nodeOperatorId);
          return this.nodeService.findAll(this.nodeOperatorId);
        }),
        switchMap(({ data: nodes }) => {
          return concat(
            ...nodes.map((node) => this.deviceService.findAll(node.id))
          ).pipe(toArray());
        }),
        switchMap((responses) => {
          this.devices = responses.flatMap((r) => r.data ?? []);
          return this.nodeOperatorService.getNodeStatus(this.nodeOperatorId);
        }),
        switchMap(({ data: status }) => {
          this.status = status;
          return of(true);
        })
      )
      .subscribe({
        next: () => {
          this.markers = this.devices.map(
            (d) =>
              new Leaflet.Marker(
                {
                  lat: parseFloat(d.location.lat),
                  lng: parseFloat(d.location.long),
                },
                {
                  icon: this.createMarkerIcon(d.camera.type),
                }
              )
          );
          this.updateMap();
        },
        error: (err: HttpErrorResponse) =>
          this.toastService.showError(err.error?.message ?? err.message),
      });
    this.subscriptions.push(activatedRouteSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.updateMap();
  }

  private initialize(nodeOperatorId: string) {
    this.nodeOperatorId = nodeOperatorId;

    if (this.map) {
      this.markers.forEach((m) => m.removeFrom(this.map));
      this.markers = [];
    }

    this.devices = [];
    this.status = {
      node_status: {
        active: 0,
        not_active: 0,
      },
      device_status: {
        active: 0,
        not_active: 0,
      },
    };
  }

  private updateMap() {
    if (!this.map || this.markers.length === 0) {
      return;
    }

    this.markers.forEach((m) => m.addTo(this.map));
    const bounds = Leaflet.featureGroup(this.markers).getBounds();
    this.map.fitBounds(bounds);
  }

  private createMarkerIcon(type: 'ptz' | 'static' | string) {
    return Leaflet.divIcon({
      className: 'border-0',
      html:
        type.toLocaleLowerCase() === 'static'
          ? `<div class="bg-dark border border-3 border-danger rounded-circle w-100 h-100 d-flex justify-content-center align-items-center"><i class="bi bi-camera-video-fill"></i></div>`
          : `<div class="bg-dark border border-3 border-danger rounded-circle w-100 h-100 d-flex justify-content-center align-items-center"><img class="object-fit-contain" style="width: 14px; height: 14px" src="assets/icons/icons8-dome-camera-32.png"/></div>`, // Bootstrap icon class here
      iconSize: [24, 24], // Size of the icon
    });
  }
}