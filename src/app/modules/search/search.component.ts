import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ObjectItemModel,
  SelectObjectDialogComponent,
} from './components/select-object-dialog/select-object-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from 'src/app/data/service/navigation.service';
import { ToastService } from '@app/services/toast.service';
import { SearchService } from 'src/app/data/service/search.service';
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  Subscription,
  catchError,
  filter,
  finalize,
  switchMap,
  tap,
} from 'rxjs';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import * as Utils from '@app/helpers/function';
import { Device } from 'src/app/data/schema/boho-v2';
import { EventData } from './models';
import { EventDetailComponent } from '@shared/components/event-detail/event-detail.component';
import { CameraType_PTZ, RuleTypeItemsSource } from 'src/app/data/constants';
import { ColorNames } from 'src/app/data/constants/colors.constant';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly ObjectIdMap: {
    [key: string]: number;
  } = {
    bike: 0,
    car: 1,
    bus: 2,
    truck: 3,
    ambulance: 4,
    firetruck: 5,
    people: 6,
  };

  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _toastService = inject(ToastService);
  private _searchService = inject(SearchService);
  private _subscriptions: Subscription[] = [];

  viewMode: string = 'grid-view';
  gridColumn: number = 3;

  paginationInfo: {
    pageIndex: number;
    pageLength: number;
  } = {
    pageIndex: 1,
    pageLength: 50,
  };
  totalEvents: number = 0;
  eventDataset: EventData[] = [];

  selectedEvents = new Set<string>();

  triggerSearch$ = new Subject<{
    devices: Device[];
    startTime: string;
    endTime: string;
    objectIds?: string[];
    ruleType: number[];
    licensePlate: string;
    showVehicleOnly: boolean;
    pageIndex: number;
    pageLength: number;
    color: number[];
  }>();
  isLoading$ = new BehaviorSubject<boolean>(false);
  form = new FormGroup({
    startTime: new FormControl<string>(
      moment().subtract(24, 'hours').format('yyyy-MM-DDTHH:mm'),
      [Validators.required]
    ),
    endTime: new FormControl<string>(moment().format('yyyy-MM-DDTHH:mm'), [
      Validators.required,
    ]),
    objects: new FormControl<ObjectItemModel[]>([]),
    ruleType: new FormControl<number[]>([]),
    licensePlate: new FormControl<string>(''),
    showVehileOnly: new FormControl<boolean>(false),
  });

  ruleItems = RuleTypeItemsSource;

  get gridRow(): number {
    return Math.ceil(this.paginationInfo.pageLength / this.gridColumn);
  }

  get canSubmit() {
    return this.form.valid;
  }

  get selectedObjects(): ObjectItemModel[] {
    return this.form.get('objects')?.value ?? [];
  }

  ngOnInit(): void {
    this.resetForm();

    this._subscriptions.push(
      this.triggerSearch$
        .pipe(
          filter(({ devices }) => devices.length > 0),
          tap(() => {
            this.isLoading$.next(true);
          }),
          finalize(() => {
            this.isLoading$.next(false);
          }),
          switchMap(
            ({
              devices,
              startTime,
              endTime,
              objectIds,
              ruleType,
              pageIndex,
              pageLength,
              licensePlate,
              color,
            }) =>
              this._searchService
                .search({
                  dis: devices.map(({ id }) => id),
                  tq: 'custom',
                  p: pageIndex,
                  pl: pageLength,
                  eit: ruleType.length > 0 ? ruleType.join(',') : undefined,
                  ot: objectIds?.map((id) => this.ObjectIdMap[id]),
                  start: startTime,
                  end: endTime,
                  lp: licensePlate === '' ? undefined : licensePlate,
                  color,
                })
                .pipe(
                  switchMap(({ data: { events, total, total_pages } }) => {
                    this.totalEvents = total;
                    this.eventDataset = events.map((event) => {
                      const device = devices.find(
                        (device) => (device.id as any) === event.device_id
                      );
                      event.node_id = device?.node_id ?? '';
                      return {
                        data: event,
                        address: device?.address ?? '[Chưa cập nhật]',
                        objectIcon: Utils.getObjectIcon(event),
                        selected: false,
                        cameraType: device?.camera.type || '',
                      };
                    });
                    return EMPTY;
                  }),
                  catchError((err: HttpErrorResponse) => {
                    this._toastService.showError(
                      `Search event failed with error: ${
                        err.error?.message ?? err.message
                      }`
                    );
                    this.eventDataset = [];
                    this.totalEvents = 0;
                    return EMPTY;
                  })
                )
          )
        )
        .subscribe()
    );
    this._subscriptions.push();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  setGridColumn(value: number) {
    this.gridColumn = value;
    this.viewMode = 'grid-view';
  }

  trackById(_: any, item: any) {
    return item.id;
  }

  search() {
    this.triggerSearch$.next({
      devices: this._navigationService.selectedDevices$.getValue(),
      startTime: moment(this.form.get('startTime')!.value).format(
        'Y-M-D H:m:s'
      ),
      endTime: moment(this.form.get('endTime')!.value).format('Y-M-D H:m:s'),
      licensePlate: this.form.get('licensePlate')?.value?.trim() ?? '',
      showVehicleOnly: false,
      pageIndex: this.paginationInfo.pageIndex,
      pageLength: this.paginationInfo.pageLength,
      objectIds: this.selectedObjects.map((object) => object.id),
      ruleType: this.form.controls.ruleType.value ?? [],
      color: this.selectedObjects.map((o) => {
        /// Not support color for type of people/bike
        if (o.id === 'people' || o.id === 'bike' || o.colors[0] === '') {
          return 0;
        }

        return ColorNames.findIndex((color) => color === o.colors[0]);
      }),
    });
  }

  submit() {
    this.paginationInfo.pageIndex = 1;
    this.search();
  }

  addObject() {
    const modalRef = this._modalService.open(SelectObjectDialogComponent, {});
    (modalRef.componentInstance as SelectObjectDialogComponent).data =
      this.form.get('objects')!.value!;

    modalRef.result.then(
      ({ data }) => this.form.get('objects')?.setValue(data),
      () => {}
    );
  }

  export() {
    this.selectedEvents.clear();
    this.eventDataset.forEach((event) => (event.selected = false));
  }

  resetForm() {
    this.form.reset({
      startTime: moment().subtract(3, 'days').format('yyyy-MM-DDTHH:mm'),
      endTime: moment().format('yyyy-MM-DDTHH:mm'),
      objects: [],
      ruleType: [],
      licensePlate: '',
      showVehileOnly: false,
    });
  }

  onEventSelectionChange(eventData: EventData) {
    if (eventData.selected) {
      this.selectedEvents.add(eventData.data.event_id);
    } else {
      this.selectedEvents.delete(eventData.data.event_id);
    }
  }

  onEventClick({ data, cameraType }: EventData) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = data;
    component.showPresetInfo = cameraType === CameraType_PTZ;
  }
}
