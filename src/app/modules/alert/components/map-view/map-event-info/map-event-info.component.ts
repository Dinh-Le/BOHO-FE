import { Component, Input } from '@angular/core';
import { EventInfo } from '@modules/alert/models';

@Component({
  selector: 'app-map-event-info',
  templateUrl: 'map-event-info.component.html',
})
export class MapEventInfoComponent {
  @Input() event!: EventInfo;

  get address(): string {
    return this.event.device?.address ?? '[Chưa cập nhật]';
  }

  get detection_time(): string {
    return this.event.data.images_info[0].detection_time;
  }

  get object_icon(): string {
    return this.event.object_icon ?? '';
  }

  get event_info(): string {
    return `${this.event.data.images_info[0].event_type}, ${this.event.data.alarm_type}`;
  }

  get is_verify(): boolean {
    return this.event.data.is_verify;
  }
}
