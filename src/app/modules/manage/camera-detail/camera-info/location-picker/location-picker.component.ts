import { Component, inject } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FormDialogComponent } from '@modules/manage/form-dialog/form-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-location-picker',
  templateUrl: 'location-picker.component.html',
  styleUrls: ['location-picker.component.scss'],
  standalone: true,
  imports: [LeafletModule, FormDialogComponent],
})
export class LocationPickerComponent {
  activeModal = inject(NgbActiveModal);

  marker = new Leaflet.Marker({
    lat: 10.7750185,
    lng: 106.7588497,
  }, {
    draggable: true
  });

  set latLng({ lat, lng }: { lat: number; lng: number }) {
    this.marker.setLatLng({ lat, lng });
    if (this.map) {
      this.map.setView({ lat, lng });
    }
  }

  get latLng() {
    const {lat, lng} = this.marker.getLatLng();
    return {lat, lng};
  }

  map: Leaflet.Map | undefined;
  options: Leaflet.MapOptions = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ],
    zoom: 16,
    center: this.marker.getLatLng(),
  };

  onMapReady($event: any) {
    this.map = $event as Leaflet.Map;
    this.marker.addTo(this.map);
  }

  mapClicked($event: any) {
    const {lat, lng} = $event.latlng;
    this.marker.setLatLng({lat, lng});
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close(this.latLng);
  }
}
