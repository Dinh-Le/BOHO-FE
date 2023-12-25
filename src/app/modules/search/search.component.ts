import { Component, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventService } from 'src/app/data/service/event.service';
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
import { finalize, from, map, mergeAll, of, tap } from 'rxjs';
import { EventInfo } from 'src/app/data/schema/boho-v2/event';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private eventService = inject(EventService);
  private modelService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _toastService = inject(ToastService);
  private _searchService = inject(SearchService);

  viewMode: string = 'grid-view';
  gridColumn: string = '3';
  pageLengthList = [25, 50, 100];

  paginationInfo: {
    currentPage: number;
    pageLength: number;
    totalItems: number;
  } = {
    currentPage: 1,
    pageLength: 50,
    totalItems: 0,
  };
  events: EventInfo[] = [];

  form = new FormGroup({
    startTime: new FormControl(null, [Validators.required]),
    endTime: new FormControl(null, [Validators.required]),
    objects: new FormControl(),
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

  ngOnInit(): void {
    // this.eventService.findAll().subscribe((events) => {
    //   this.events = events;
    //   this.paginationInfo.totalItems = this.events.length;
    // });
  }

  get canSubmit() {
    return this.form.valid;
  }

  get currentEvents(): (EventInfo | null)[] {
    let startIndex =
      (this.paginationInfo.currentPage - 1) * this.paginationInfo.pageLength;
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

  setGridColumn(value: string) {
    this.gridColumn = value;
    this.viewMode = 'grid-view';
  }

  trackById(_: any, item: any) {
    return item.id;
  }

  search() {
    this.events = [];
    from(
      Object.entries(this._navigationService.selectedDeviceIds).filter(
        ([k, v]) => v.size > 0
      )
    )
      .pipe(
        tap(() => this.form.disable()),
        map(([nodeId, deviceIds]) => {
          const query: SearchQuery = {
            dis: [...deviceIds],
            oit: [],
            tq: '',
            eit: [],
            limit: 100,
            start: '',
            end: '',
          };
          return this._searchService.search(nodeId, query);
        }),
        mergeAll(),
        map((response) => {
          if (!response.success) {
            throw Error(
              `Fetch event data failed with error: ${response.message}`
            );
          }

          return response.data;
        }),
        finalize(() => this.form.enable())
      )
      .subscribe({
        next: (events: EventInfo[]) => {
          this.events.push(...events);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  onPageChanged(value: number) {
    this.paginationInfo.currentPage = value;
  }

  objectItems: ObjectItemModel[] = [];

  addObject() {
    const modalRef = this.modelService.open(SelectObjectDialogComponent, {});

    (modalRef.componentInstance as SelectObjectDialogComponent).data =
      this.objectItems;

    modalRef.result.then(
      ({ data }) => (this.objectItems = data),
      () => {}
    );
  }
}
