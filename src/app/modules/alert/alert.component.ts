import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { EventInfo } from './models';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import {
  Observable,
  Subscription,
  delay,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import { EventService } from 'src/app/data/service/event.service';
import { Device } from 'src/app/data/schema/boho-v2';
import { Objects, Severities } from 'src/app/data/constants';
import { NavigationService } from 'src/app/data/service/navigation.service';

export interface MqttEventMessage {
  node_id: string;
  camera_id: string;
  device_id?: string;
  address?: string;
  camera_name: string;
  event_time: string;
  preset_id: number;
  level: number;
  tracking_number: string;
  alarm_type: string;
  rule_id: number;
  rule_name: string;
  event_id: string;
  detection_id: string;
  snapshot$?: Observable<string>;
  device?: Device;
  bounding_box: {
    topleftx: number;
    toplefty: number;
    bottomrightx: number;
    bottomrighty: number;
  };
  images_info: {
    detection_id: string;
    bounding_box: {
      topleftx: number;
      toplefty: number;
      bottomrightx: number;
      bottomrighty: number;
    };
    bounding_box_color: string;
  }[];
  object_type: string;
  background_color?: string;
  object_icon: string;
}

interface FilterOptions {
  level: number;
  object: string;
  rule_name: string;
  device_ids: string[];
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  private static readonly MAX_EVENTS = 100;
  private static readonly EVENT_IMAGE_DELAY = 2000; // 4 miliseconds

  timePeriods: SelectItemModel[] = [
    {
      value: '30p',
      label: '30p trước',
    },
    {
      value: '1h',
      label: '1h trước',
    },
    {
      value: '6h',
      label: '6h trước',
    },
    {
      value: '12h',
      label: '12h trước',
    },
    {
      value: '24h',
      label: '24h trước',
    },
    {
      value: '1d',
      label: 'Hôm qua',
    },
    {
      value: '1w',
      label: 'Tuần trước',
    },
  ];
  gridCol: number = 5;
  viewMode: 'grid' | 'map' | 'list' = 'map';
  events: EventInfo[] = [{}];
  mqttEvents: MqttEventMessage[] = [
    // {
    //   camera_id: '65',
    //   camera_name: 'Camerra 188',
    //   event_time: '2024-03-01T00:48:39.604596+07',
    //   preset_id: 141,
    //   level: 3,
    //   tracking_number: '108424',
    //   alarm_type: 'TRESPASSING EVENT',
    //   rule_id: 71,
    //   event_id: '9f5217f7-9183-456b-8ae7-99532a82fcab',
    //   detection_id: 'a5011cf8-1ad7-4720-89e1-daacaf79a21e',
    //   bounding_box: {
    //     topleftx: 444,
    //     toplefty: 670,
    //     bottomrightx: 586,
    //     bottomrighty: 795,
    //   },
    //   object_type: 'car',
    //   rule_name: 'TRESPASSING EVENT',
    //   node_id: '8732910f-bb14-4cd4-8ecd-9bee6f335b1a',
    //   background_color: '#b84043ff',
    //   object_icon: 'side-car',
    //   images_info: [
    //     {
    //       detection_id: 'a5011cf8-1ad7-4720-89e1-daacaf79a21e',
    //       bounding_box: {
    //         topleftx: 444,
    //         toplefty: 670,
    //         bottomrightx: 586,
    //         bottomrighty: 795,
    //       },
    //       bounding_box_color: 'green',
    //     },
    //   ],
    //   device_id: '65',
    // },
  ];
  isMuted: boolean = false;
  isPaused: boolean = false;
  ruleTypes: SelectItemModel[] = [
    { label: 'Xâm nhập vùng', value: 'trespassing event' },
    { label: 'Đi luẩn quẩn', value: 'loitering event' },
    { label: 'Vượt đường kẻ', value: 'tripwire event' },
    { label: 'Đỗ xe sai nơi quy định', value: 'sabotage event' },
  ];
  severities: SelectItemModel[] = Severities.map((e) => ({
    value: e.id,
    label: e.name,
  }));
  objectTypes: SelectItemModel[] = Objects.map((e) => ({
    value: e.id,
    label: e.name,
  }));
  filterOptions: FilterOptions = {
    level: 0,
    object: 'all',
    rule_name: 'all',
    device_ids: [],
  };

  private _subscriptions: Subscription[] = [];
  private _beep = new Audio(
    'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
  );

  paginationInfo: {
    pageIndex: number;
    pageLength: number;
  } = {
    pageIndex: 1,
    pageLength: 50,
  };

  get currentMqttEvents(): MqttEventMessage[] {
    const startIndex =
      (this.paginationInfo.pageIndex - 1) * this.paginationInfo.pageLength;
    return this.mqttEvents.slice(
      startIndex,
      startIndex + this.paginationInfo.pageLength
    );
  }

  constructor(
    private _mqttService: MqttService,
    private _deviceService: DeviceService,
    private _eventService: EventService,
    private _navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this._mqttService.connect({
      host: 'localhost',
      port: 8082,
      protocol: 'ws',
      path: '/mqtt',
    });

    const mqttSubscription = this._mqttService
      .observe('service-communicate')
      .pipe(
        // tap(() => console.log('Received new message')),
        map((message: IMqttMessage) => {
          const payloadString = message.payload.toLocaleString();
          const event = JSON.parse(payloadString) as MqttEventMessage;

          switch (event.level) {
            case 3:
              event.background_color = '#b84043ff';
              break;
            case 2:
              event.background_color = '#4d8df6ff';
              break;
            default:
              event.background_color = '#4a494bff';
          }

          if (event.object_type === 'person') {
            event.object_type = 'people';
          }

          const object = Objects.find((o) => o.id === event.object_type);
          event.object_icon = object?.icon ?? '';

          event.images_info = [
            {
              detection_id: event.detection_id,
              bounding_box: event.bounding_box,
              bounding_box_color: object?.bounding_box_color ?? 'red',
            },
          ];

          event.device_id = event.camera_id;
          event.device = this._navigationService.selectedDevices$
            .getValue()
            .find(({ id }) => event.camera_id === id.toString());

          console.log('Received new event:', event);
          return event;
        }),
        filter((event: MqttEventMessage) => {
          if (this.isPaused) {
            return false;
          }

          if (
            this.filterOptions.level > 0 &&
            this.filterOptions.level !== event.level
          ) {
            return false;
          }

          if (
            this.filterOptions.rule_name !== 'all' &&
            this.filterOptions.rule_name !== event.alarm_type.toLowerCase()
          ) {
            return false;
          }

          if (
            this.filterOptions.object !== 'all' &&
            this.filterOptions.object !== event.object_type
          ) {
            return false;
          }

          if (!event.device) {
            return false;
          }

          // const noSelectedDevices = Object.values(
          //   this._navigationService.selectedDeviceIds
          // ).every((devices) => Object.keys(devices).length === 0);
          // if (
          //   noSelectedDevices ||
          //   !(
          //     event.node_id in this._navigationService.selectedDeviceIds &&
          //     event.camera_id.toString() in
          //       this._navigationService.selectedDeviceIds[event.node_id]
          //   )
          // ) {
          //   return false;
          // }

          return true;
        }), // filter here,
        tap(() => {
          if (!this.isMuted) {
            this._beep.pause();
            this._beep.play();
          }
        }),
        delay(AlertComponent.EVENT_IMAGE_DELAY)
        // tap(() => console.log('delay ended'))
      )
      .subscribe((event) => {
        // console.log('fetch - snapshot')
        event.snapshot$ = this._eventService
          .getImage(event.node_id, event.camera_id, event.detection_id, 'full')
          .pipe(switchMap((blod) => of(URL.createObjectURL(blod))));

        this.mqttEvents.unshift(event);
        if (this.mqttEvents.length > AlertComponent.MAX_EVENTS) {
          this.mqttEvents.pop();
        }
      });
    this._subscriptions.push(mqttSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._mqttService.disconnect(true);
  }

  trackByValue(_: number, item: SelectItemModel) {
    return item.value;
  }

  clearFilter() {
    this.filterOptions = {
      level: 0,
      object: 'all',
      rule_name: 'all',
      device_ids: [],
    };
  }
}
