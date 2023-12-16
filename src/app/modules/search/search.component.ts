import { Component, OnInit, inject } from '@angular/core';
import { LoadingService } from '@app/services/loading.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventInfo } from 'src/app/data/schema/event-info';
import { EventService } from 'src/app/data/service/event.service';
import {
  ObjectItemModel,
  SelectObjectDialogComponent,
} from './components/select-object-dialog/select-object-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private eventService = inject(EventService);
  private loadingService = inject(LoadingService);
  private modelService = inject(NgbModal);

  viewMode: string = 'map-view';
  gridColumn: string = '3';

  paginationInfo: {
    currentPage: number;
    pageLength: number;
    totalItems: number;
  } = {
    currentPage: 1,
    pageLength: 30,
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
  ruleItems: SelectItemModel[] = [{ value: '1', label: 'Vượt đường kẻ' }];

  ngOnInit(): void {
    this.eventService.findAll().subscribe((events) => {
      this.events = events;
      this.paginationInfo.totalItems = this.events.length;
    });
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
    this.loadingService.loading = true;
    setTimeout(() => (this.loadingService.loading = false), 3000);
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
