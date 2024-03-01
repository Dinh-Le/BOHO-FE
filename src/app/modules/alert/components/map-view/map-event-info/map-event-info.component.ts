import { Component, Input } from '@angular/core';
import { MqttEventMessage } from '@modules/alert/alert.component';

@Component({
  selector: 'app-map-event-info',
  templateUrl: 'map-event-info.component.html',
})
export class MapEventInfoComponent {
  @Input() event?: MqttEventMessage;
}
