import { Component, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ObjectItemModel,
  SelectObjectDialogComponent,
} from './components/select-object-dialog/select-object-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';
import { NavigationService } from 'src/app/data/service/navigation.service';
import { ToastService } from '@app/services/toast.service';
import {
  SearchQuery,
  SearchService,
} from 'src/app/data/service/search.service';
import { finalize, tap } from 'rxjs';
import { EventInfo } from 'src/app/data/schema/boho-v2/event';
import * as moment from 'moment';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _toastService = inject(ToastService);
  private _searchService = inject(SearchService);

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
  events: any[] = [];
  selectedEvents: any[] = [];

  form = new FormGroup({
    startTime: new FormControl<string>(
      moment().subtract(24, 'hours').format('yyyy-MM-DDTHH:mm'),
      [Validators.required]
    ),
    endTime: new FormControl<string>(moment().format('yyyy-MM-DDTHH:mm'), [
      Validators.required,
    ]),
    objects: new FormControl<ObjectItemModel[]>([]),
    rule: new FormControl(),
    resolutionMinute: new FormControl<number>(0),
    resolutionSecond: new FormControl<number>(0),
    licensePlate: new FormControl<string>(''),
    showVehileOnly: new FormControl<boolean>(false),
  });
  ruleItems: SelectItemModel[] = [
    'Vượt đường kẻ',
    'Xâm nhập vùng',
    'Đi luẩn quẩn',
    'Đỗ xe sai nơi quy định',
  ].map((name, index) => ({
    value: index,
    label: name,
  }));

  ngOnInit(): void {}

  get canSubmit() {
    return this.form.valid;
  }

  get currentEvents(): (EventInfo | null)[] {
    let startIndex =
      (this.paginationInfo.pageIndex - 1) * this.paginationInfo.pageLength;
    let endIndex = startIndex + this.paginationInfo.pageLength;

    let currentEvents: (EventInfo | null)[] = this.events.slice(
      startIndex,
      endIndex
    );

    if (
      this.viewMode === 'grid-view' &&
      currentEvents.length < this.paginationInfo.pageLength
    ) {
      let n = this.paginationInfo.pageLength - currentEvents.length;
      currentEvents.push(...Array(n).fill(null));
    }

    return currentEvents;
  }

  get selectedObjects(): ObjectItemModel[] {
    return this.form.get('objects')!.value!;
  }

  setGridColumn(value: number) {
    this.gridColumn = value;
    this.viewMode = 'grid-view';
  }

  trackById(_: any, item: any) {
    return item.id;
  }

  submit() {
    this.paginationInfo.pageIndex = 1;
    this.search();
  }

  search() {
    this.events = [];

    const devices = Object.entries(this._navigationService.selectedDeviceIds)
      .flatMap(([_, v]) => Object.values(v))
      .reduce(
        (prev, curr) =>
          Object.assign(prev, {
            [curr.id]: curr,
          }),
        {}
      );

    if (Object.keys(devices).length === 0) {
      this._toastService.showError('No device selected');
      return;
    }

    const objectIdMap: {
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
    const query: SearchQuery = {
      dis: Object.keys(devices),
      tq: 'custom',
      p: this.paginationInfo.pageIndex,
      pl: this.paginationInfo.pageLength,
      eit: this.form.get('rule')?.value?.value,
      ot: this.form
        .get('objects')
        ?.value?.map((e) => objectIdMap[e.id])
        .filter((e) => e !== undefined),
      start: moment(this.form.get('startTime')!.value).format('Y-M-D H:m:s'),
      end: moment(this.form.get('endTime')!.value).format('Y-M-D H:m:s'),
    };

    this._searchService
      .search(query)
      .pipe(
        tap(() => this.form.disable()),
        finalize(() => this.form.enable())
      )
      .subscribe({
        next: ({ data }) => {
          this.totalEvents = data.total;
          this.events = data.events.map((e) =>
            Object.assign(e, {
              node_id: devices[e.device_id].node_id,
            })
          );
        },
        error: ({ message }) => this._toastService.showError(message),
      });
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

  export(ev: Event) {
    this.selectedEvents = [];
  }

  resetForm() {
    this.form.reset({
      startTime: moment().subtract(24, 'hours').format('yyyy-MM-DDTHH:mm'),
      endTime: moment().format('yyyy-MM-DDTHH:mm'),
      objects: [],
      resolutionMinute: 0,
      resolutionSecond: 0,
      licensePlate: '',
      showVehileOnly: false,
    });
  }
}
