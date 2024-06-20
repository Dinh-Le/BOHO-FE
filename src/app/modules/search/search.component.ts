import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ObjectItemModel,
  SelectObjectDialogComponent,
} from './components/select-object-dialog/select-object-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';
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
    ruleId?: string;
    licensePlate: string;
    showVehicleOnly: boolean;
    pageIndex: number;
    pageLength: number;
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
    rule: new FormControl<SelectItemModel | undefined>(undefined),
    licensePlate: new FormControl<string>(''),
    showVehileOnly: new FormControl<boolean>(false),
  });
  ruleItems: SelectItemModel[] = [
    'Xâm nhập vùng',
    'Đi luẩn quẩn',
    'Vượt đường kẻ',
    'Đỗ xe sai nơi quy định',
  ].map((name, index) => ({
    value: index,
    label: name,
  }));

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
              ruleId,
              pageIndex,
              pageLength,
              licensePlate,
            }) =>
              this._searchService
                .search({
                  dis: devices.map(({ id }) => id),
                  tq: 'custom',
                  p: pageIndex,
                  pl: pageLength,
                  eit: ruleId,
                  ot: objectIds?.map((id) => this.ObjectIdMap[id]),
                  start: startTime,
                  end: endTime,
                  lp: licensePlate === '' ? undefined : licensePlate,
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
      objectIds: this.form.get('objects')?.value?.map((object) => object.id),
      ruleId: this.form.get('rule')?.value?.value,
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
      rule: undefined,
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

  onEventClick({ data }: EventData) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = data;
  }
}
