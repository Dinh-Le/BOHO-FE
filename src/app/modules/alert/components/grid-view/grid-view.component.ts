import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { EventInfo } from '@modules/alert/models';
import { EventDetailComponent } from '@shared/components/event-detail/event-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-grid-view',
  templateUrl: 'grid-view.component.html',
  styleUrls: ['grid-view.component.scss'],
})
export class GridViewComponent implements OnChanges {
  @Input() events: EventInfo[] = [];
  @Input() col: number = 2;
  @Input() row: number = 25;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _modalService: NgbModal
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('col' in changes) {
      const el = this._viewContainerRef.element.nativeElement as HTMLElement;
      el.style[
        'gridTemplateColumns'
      ] = `repeat(${changes['col'].currentValue}, 1fr)`;
    }
  }

  trackByEventId(_: number, event: EventInfo) {
    return event.data.images_info[0].detection_id;
  }

  showDetailedEvent(event: EventInfo) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = event.data;
  }

  showEventLocation(event: Event, eventData: EventInfo) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = eventData.data;
    component.type = 'location';

    event.stopPropagation();
  }
}
