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

  setGridColumn(value: number) {
    this.gridColumn = value;
    this.viewMode = 'grid-view';
  }

  trackById(_: any, item: any) {
    return item.id;
  }

  search() {
    this.events = [];
    const nodes = Object.entries(
      this._navigationService.selectedDeviceIds
    ).filter(([k, v]) => v.size > 0);
    if (nodes.length == 0) {
      return;
    }

    const [nodeId, deviceIds] = nodes[0];
    const query: SearchQuery = {
      dis: [...deviceIds],
      tq: 'week',
      p: 1,
      pl: this.paginationInfo.pageLength,
    };

    this._searchService
      .search(nodeId, query)
      .pipe(
        tap(() => this.form.disable()),
        finalize(() => this.form.enable())
      )
      .subscribe({
        next: (response) => {
          this.paginationInfo = Object.assign({}, this.paginationInfo, {
            pageIndex: 1,
          });
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

  objectItems: ObjectItemModel[] = [];

  addObject() {
    const modalRef = this._modalService.open(SelectObjectDialogComponent, {});

    (modalRef.componentInstance as SelectObjectDialogComponent).data =
      this.objectItems;

    modalRef.result.then(
      ({ data }) => (this.objectItems = data),
      () => {}
    );
  }
}
