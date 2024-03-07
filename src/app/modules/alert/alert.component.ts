import { Component, OnDestroy, OnInit } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  EMPTY,
  Subscription,
  concat,
  switchMap,
  toArray,
} from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import { EventService } from 'src/app/data/service/event.service';
import { Objects, Severities } from 'src/app/data/constants';
import { NavigationService } from 'src/app/data/service/navigation.service';
import {
  SearchEvent,
  SearchService,
} from 'src/app/data/service/search.service';
import { EventFilterOptions, EventInfo } from './models';
import * as moment from 'moment';
import { ToastService } from '@app/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit, OnDestroy {
  eventStatues: SelectItemModel[] = [
    { label: 'Tất cả', value: 0 },
    { label: 'Đã xem', value: 1 },
    { label: 'Chưa xem', value: 2 },
    { label: 'Có sao', value: 3 },
    { label: 'Không sao', value: 4 },
    { label: 'Thật', value: 5 },
    { label: 'Giả', value: 6 },
  ];
  timePeriods: SelectItemModel[] = [
    {
      value: '30 minutes',
      label: '30p trước',
    },
    {
      value: '1 hour',
      label: '1h trước',
    },
    {
      value: '6 hours',
      label: '6h trước',
    },
    {
      value: '12 hours',
      label: '12h trước',
    },
    {
      value: '24 hours',
      label: '24h trước',
    },
    {
      value: '1 day',
      label: 'Hôm qua',
    },
    {
      value: '1 week',
      label: 'Tuần trước',
    },
  ];
  gridCol: number = 5;
  viewMode: 'grid' | 'map' | 'list' = 'grid';
  isMuted: boolean = false;
  isPaused: boolean = false;
  ruleTypes: SelectItemModel[] = [
    { label: 'Xâm nhập vùng', value: 0 },
    { label: 'Đi luẩn quẩn', value: 1 },
    { label: 'Vượt đường kẻ', value: 2 },
    { label: 'Đỗ xe sai nơi quy định', value: 3 },
  ];
  severities: SelectItemModel[] = Severities.map((e) => ({
    value: e.id,
    label: e.name,
  }));
  objectTypes: SelectItemModel[] = [
    {
      value: 0,
      label: 'Xe máy',
    },
    {
      value: 1,
      label: 'Xe ô-tô',
    },
    {
      value: 2,
      label: 'Xe buýt',
    },
    {
      value: 3,
      label: 'Xe tải',
    },
    {
      value: 4,
      label: 'Xe cứu thương',
    },
    {
      value: 5,
      label: 'Xe cứu hỏa',
    },
    {
      value: 6,
      label: 'Người',
    },
  ];
  filterOptions: EventFilterOptions = {
    timePeriod: this.timePeriods[0],
    objects: [],
    rules: [],
    severities: [],
    status: this.eventStatues[0],
  };

  private _subscriptions: Subscription[] = [];
  private _beep = new Audio(
    'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
  );

  events: EventInfo[] = [];
  paginationInfo: {
    pageIndex: number;
    pageLength: number;
  } = {
    pageIndex: 1,
    pageLength: 50,
  };

  get currentEvents(): EventInfo[] {
    const startIndex =
      (this.paginationInfo.pageIndex - 1) * this.paginationInfo.pageLength;
    return this.events.slice(
      startIndex,
      startIndex + this.paginationInfo.pageLength
    );
  }

  get hasSelectedEvent(): boolean {
    return this.currentEvents.some((event) => event.selected);
  }

  get gridRow(): number {
    return Math.ceil(this.paginationInfo.pageLength / this.gridCol);
  }

  private _timer!: NodeJS.Timeout;

  constructor(
    private _deviceService: DeviceService,
    private _eventService: EventService,
    private _navigationService: NavigationService,
    private _searchService: SearchService,
    private _toastService: ToastService
  ) {
    this.clearFilter();
  }

  startTimer() {
    this.refresh();
  }

  refresh() {
    const devices = this._navigationService.selectedDevices$.getValue().reduce(
      (devices, device) =>
        Object.assign(devices, {
          [device.id]: device,
        }),
      {}
    );
    const timePeriod = this.getItem(this.timePeriods);
    const [amount, unit] = timePeriod!.value.toString().split(' ');

    return this._searchService
      .search({
        dis: Object.keys(devices),
        tq: 'custom',
        p: this.paginationInfo.pageIndex,
        pl: 100,
        eit: this.getItem(this.ruleTypes)?.value,
        ot: this.getItems(this.ruleTypes).map((it) => it.value),
        start: moment().subtract(amount, unit).format('Y-M-D H:m:s'),
        end: moment().format('Y-M-D H:m:s'),
      })
      .subscribe({
        next: ({ data }) => {
          this.events = data.events
            .filter((event) => event.device_id in devices)
            .map((event) => {
              const device = devices[event.device_id];
              event.node_id = device.node_id;
              return {
                data: event,
                device: device,
                background_color: this.getBackgroundColor(event),
                object_icon: this.getObjectIcon(event),
                severity:
                  Severities.find((s) => s.id === event.alarm_level)?.name ??
                  '',
              };
            });
        },
        complete: () => {
          clearTimeout(this._timer);
          this._timer = setTimeout(() => this.refresh(), 30000);
        },
      });
  }

  ngOnInit(): void {
    this.startTimer();

    this._navigationService.selectedDevices$.subscribe(() => {
      clearTimeout(this._timer);
      this.startTimer();
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this._timer);
  }

  trackByValue(_: number, item: SelectItemModel) {
    return item.value;
  }

  clearFilter() {
    this.setItem(this.timePeriods[2], this.timePeriods);
  }

  setItem(item: SelectItemModel, items: SelectItemModel[]) {
    items.forEach((it) => (it.selected = it.value == item.value));
  }

  getItem(items: SelectItemModel[]): SelectItemModel | undefined {
    return items.find((it) => it.selected);
  }

  getItems(items: SelectItemModel[]): SelectItemModel[] {
    return items.filter((it) => it.selected);
  }

  getBackgroundColor({ alarm_level }: SearchEvent): string {
    switch (alarm_level) {
      case 3:
        return '#b84043ff';
      case 2:
        return '#4d8df6ff';
      default:
        return '#4a494bff';
    }
  }

  getObjectIcon(event: SearchEvent): string {
    const event_type =
      event.images_info[0].event_type === 'person'
        ? 'people'
        : event.images_info[0].event_type;

    return Objects.find((o) => o.id === event_type)?.icon ?? '';
  }

  markEventsAs(type: 'fake' | 'real' | 'important') {
    const requests = this.currentEvents
      .filter((event) => event.selected)
      .map((event) => {
        return this._eventService
          .verify(event.device.node_id!, event.device.id as any, event.data.event_id, {
            is_verify: type === 'real',
          })
          .pipe(
            switchMap(() => {
              event.data.is_verify = type === 'real';
              event.selected = false;
              return EMPTY;
            })
          );
      });
    concat(...requests)
      .pipe(toArray())
      .subscribe({
        complete: () => {
          this._toastService.showSuccess('Update event successfully');
        },
        error: (err: HttpErrorResponse) => {
          this._toastService.showError(
            `Update event failed with error: ${
              err.error?.message ?? err.message
            }`
          );
        },
      });
  }
}
