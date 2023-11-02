import { Component, inject } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-location-picker',
  templateUrl: 'location-picker.component.html',
  styleUrls: ['location-picker.component.scss'],
  standalone: true,
  imports: [LeafletModule],
})
export class LocationPickerComponent {
  activeModal = inject(NgbActiveModal);

  map: Leaflet.Map | undefined;
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

  onMapReady($event: any) {
    this.map = $event as Leaflet.Map;
  }

  mapClicked($event: any) {}
}
