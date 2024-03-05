import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventDetailComponent } from '../../../../shared/components/event-detail/event-detail.component';

@Component({
  selector: 'app-grid-view',
  templateUrl: 'grid-view.component.html',
  styleUrls: ['grid-view.component.scss'],
})
export class GridViewComponent implements OnInit, OnChanges {
  private _modalService = inject(NgbModal);

  @Input() cols: number = 3;
  @Input() events: any[] = [];
  @Input() pageLength: number = 50;

  @Input() selectedEvents: any[] = [];
  @Output() selectedEventsChange = new EventEmitter<any[]>();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('selectedEvents' in changes) {
      if (changes['selectedEvents'].currentValue.length === 0) {
        this.events = this.events.map((e) =>
          Object.assign(e, { checked: false })
        );
      }
    }
  }

  get gridTemplateColumns() {
    return `repeat(${this.cols}, 1fr)`;
  }

  get count(): number {
    const numRow = Math.ceil(this.pageLength / this.cols);
    return numRow * this.cols;
  }

  showEventDetail(index: number) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = this.events[index];
  }

  onEventSelectionChanged() {
    this.selectedEvents = this.events.filter((e) => e.checked);
    this.selectedEventsChange.emit(this.selectedEvents);
  }
}
