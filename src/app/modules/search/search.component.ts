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
import { KeyValue } from '@angular/common';

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

  form = new FormGroup({
    startTime: new FormControl(null, [Validators.required]),
    endTime: new FormControl(null, [Validators.required]),
    objects: new FormControl<ObjectItemModel[]>([]),
    rule: new FormControl(),
    resolutionMinute: new FormControl(0, [Validators.required]),
    resolutionSecond: new FormControl(0, [Validators.required]),
    licensePlate: new FormControl(''),
    showVehileOnly: new FormControl(false, [Validators.required]),
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
    return this.form.valid || true;
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
    const nodes = Object.entries(
      this._navigationService.selectedDeviceIds
    ).filter(([k, v]) => Object.keys(v).length > 0);
    if (nodes.length == 0) {
      return;
    }

    const [nodeId, devices] = nodes[0];
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
      tq: 'week',
      p: this.paginationInfo.pageIndex,
      pl: this.paginationInfo.pageLength,
      eit: this.form.get('rule')?.value?.value,
      ot: this.form
        .get('objects')
        ?.value?.map((e) => objectIdMap[e.id])
        .filter((e) => e !== undefined),
    };

    this._searchService
      .search(nodeId, query)
      .pipe(
        tap(() => this.form.disable()),
        finalize(() => this.form.enable())
      )
      .subscribe({
        next: (response) => {
          this.totalEvents = response.data.total;
          this.events = response.data.events.map((e) =>
            Object.assign(e, {
              node_id: nodeId,
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

  get selectedObjects(): ObjectItemModel[] {
    return this.form.get('objects')!.value!;
  }
}
