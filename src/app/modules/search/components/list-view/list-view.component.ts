import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-view-search',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements OnChanges {
  private _modalService = inject(NgbModal);

  @Input() events: any[] = [];
  @Input() selectedEvents: any[] = [];
  @Output() selectedEventsChange = new EventEmitter<any[]>();

  currentEvent: any;

  get address() {
    return this.currentEvent
      ? `${this.currentEvent.device_location.lat}, ${this.currentEvent.device_location.long}`
      : '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'selectedEvents' in changes &&
      changes['selectedEvents'].currentValue.length === 0
    ) {
      this.events = this.events.map((e) =>
        Object.assign(e, {
          checked: false,
        })
      );
    }
  }

  onEventSelectionChange() {
    this.selectedEvents = this.events.filter((e) => e.checked);
    this.selectedEventsChange.emit(this.selectedEvents);
  }

  showEventDetail() {
    if (!this.currentEvent) {
      return;
    }

    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = this.currentEvent;
  }

  getEventInfoBackgroundClass(level?: string): string {
    if (level === 'medium') {
      return 'bg-primary';
    } else if (level === 'high') {
      return 'bg-danger';
    } else {
      return 'bg-secondary';
    }
  }
}
