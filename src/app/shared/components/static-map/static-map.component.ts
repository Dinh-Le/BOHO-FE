import { Component, HostBinding, Input } from '@angular/core';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-static-map',
  templateUrl: 'static-map.component.html',
})
export class StaticMapComponent {
  readonly options: Leaflet.MapOptions = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
    zoom: 16,
    center: { lat: 28.626137, lng: 79.821603 },
  };

  @Input() locationData: Leaflet.LatLng[] = [];

  onMapReady(map: Leaflet.Map) {
    const markers = this.locationData.map(
      (location) =>
        new Leaflet.Marker(location, {
          // draggable: true,
          icon: Leaflet.divIcon({
            className: 'border-0',
            html: `<i  class="bi bi-geo-alt-fill text-primary" style="font-size: 48px"></i>`,
            iconSize: [48, 48], // Size of the icon
          }),
        })
    );
    markers.forEach((marker) => marker.addTo(map));
    if (markers.length > 0) {
      const group = Leaflet.featureGroup(markers);
      map.fitBounds(group.getBounds(), {
        padding: [50, 50],
      });
    }
  }
}
