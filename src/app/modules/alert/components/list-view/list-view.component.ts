import { Component, HostBinding, Input } from '@angular/core';
import { EventInfo } from '@modules/alert/models';
import { EventDetailComponent } from '@shared/components/event-detail/event-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-list-view-alert',
  templateUrl: 'list-view.component.html',
  styleUrls: ['list-view.component.scss'],
})
export class ListViewComponent {
  @HostBinding('class') classNames = 'd-flex flex-column h-100';
  @Input() events: EventInfo[] = [];

  map?: Leaflet.Map;
  options: Leaflet.MapOptions = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
    zoom: 16,
    center: { lat: 28.626137, lng: 79.821603 },
  };

  get event(): EventInfo {
    return this.events[this.eventIndex];
  }

  eventIndex: number = 0;

  constructor(private _modalService: NgbModal) {}

  trackByDetectionId(_: number, event: EventInfo) {
    return event.data.images_info[0].detection_id;
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
  }

  showEventDetail() {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = this.event.data;
  }
}
