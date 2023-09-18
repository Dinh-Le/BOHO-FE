import {
  Component,
  ComponentRef,
  Input,
  ViewContainerRef,
  inject,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import { EventInfo } from 'src/app/data/schema/event-info';
import { EventComponent } from '../event/event.component';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent {
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

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
        const eventComponentRef: ComponentRef<EventComponent> =
          this.viewContainerRef.createComponent(EventComponent);

        // set data and call detectChanges() to re-render
        eventComponentRef.instance.data = this.events[index]!;
        eventComponentRef.hostView.detectChanges();

        const marker = event.target as Leaflet.Marker;
        marker.bindPopup(eventComponentRef.location.nativeElement, {
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
