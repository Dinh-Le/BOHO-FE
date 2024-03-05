import { Component, Input } from '@angular/core';
import { EventInfo } from '@modules/alert/models';

@Component({
  selector: 'app-map-event-info',
  templateUrl: 'map-event-info.component.html',
})
export class MapEventInfoComponent {
  @Input() event!: EventInfo;

  get address() {
    return this.event.device?.address;
  }

  get detection_time() {
    return this.event.data.images_info[0].detection_time;
  }

  get object_icon() {
    return this.event.object_icon ?? '';
  }

  get event_info() {
    return `${this.event.data.images_info[0].event_type}, ${this.event.data.alarm_type}`;
  }
}
