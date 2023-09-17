import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import * as Leaflet from 'leaflet';
import { EventInfo } from 'src/app/data/schema/event-info';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent {
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
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

  @Input()
  events: (EventInfo | null)[] = [];

  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.initMarkers();
  }

  mapClicked($event: any) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  initMarkers() {
    const initialMarkers = [
      {
        position: { lat: 28.625485, lng: 79.821091 },
        draggable: true,
      },
      {
        position: { lat: 28.625293, lng: 79.817926 },
        draggable: false,
      },
      {
        position: { lat: 28.625182, lng: 79.81464 },
        draggable: true,
      },
    ];
    for (let index = 0; index < initialMarkers.length; index++) {
      const data = initialMarkers[index];
      const marker = this.generateMarker(data, index);
      marker
        .addTo(this.map)
        .bindPopup(`<b>${data.position.lat},  ${data.position.lng}</b>`);
      marker.on('mouseover', (event: Leaflet.LeafletMouseEvent) => {
        const marker = event.target as Leaflet.Marker;
        const eventInfo = this.events[0];
        const popupContent = `
        <div class="h-100 d-flex flex-column w-100">
          <div class="text-center flex-grow-1 d-flex align-items-center">
            <img
              class="h-auto w-100"
              src="${eventInfo?.thumbnailUrl}"
            />
          </div>
          <div
            style="display: grid; grid-template-columns: minmax(0, 1fr) auto;"
            class="p-2 bg-danger"
          >
            <div class="d-flex justify-content-between flex-column">
              <div class="text-truncate">
                ${eventInfo?.timestamp}
              </div>
              <div class="text-truncate">
                ${eventInfo?.address}
              </div>
              <div class="text-truncate">
                ${eventInfo?.eventType}
              </div>
            </div>
            <div class="d-flex flex-column justify-content-between">
              <div class="text-end d-flex">
                <span
                  class="me-1 licence-plate text-nowrap"
                  >${eventInfo?.licencePlate || ' '}</span
                >
                <div class="car-side-32"></div>
              </div>
              <div class="text-end">
                <i class="bi bi-star-fill text-warning"></i>
                <i class="ms-2 bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>`;
        marker.bindPopup(popupContent, {
          maxWidth: 500,
          minWidth: 500,
          closeButton: false,
          className: 'event-popup',
        });
        marker.openPopup();
      });
      this.map.panTo(data.position);
      this.markers.push(marker);
    }
  }

  generateMarker(data: any, index: number) {
    return Leaflet.marker(data.position, { draggable: data.draggable });
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
