import { Component, HostBinding, Input } from '@angular/core';
import { MqttEventMessage } from '@modules/alert/alert.component';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-list-view-alert',
  templateUrl: 'list-view.component.html',
})
export class ListViewComponent {
  @HostBinding('class') className = 'd-flex flex-column';
  @Input() events: MqttEventMessage[] = [];

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

  get event(): MqttEventMessage {
    return this.events[0];
  }

  trackByDetectionId(_: number, event: MqttEventMessage) {
    return event.detection_id;
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
  }
}
