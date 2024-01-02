import {
  Component,
  ComponentRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapEventInfoComponent } from './map-event-info/map-event-info.component';

class ExtendedMarker extends Leaflet.Marker {
  private _camera: any;

  constructor(
    latLng: L.LatLngExpression,
    camera: any,
    options?: L.MarkerOptions
  ) {
    super(latLng, options);
    this._camera = camera;
  }

  get camera() {
    return this._camera;
  }
}

@Component({
  selector: 'app-map-view',
  templateUrl: 'map-view.component.html',
  styleUrls: ['map-view.component.scss'],
})
export class MapViewComponent {
  private _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  map: Leaflet.Map | undefined;
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

  cameraList: any[] = [
    {
      latlng: new Leaflet.LatLng(10.769906, 106.775626),
      numOfEvent: 20,
      type: 'ptz',
      events: Array(20)
        .fill(0)
        .map((e, index) =>
          Object.assign(
            {},
            {
              seen: false,
              boundingBoxes: [],
              date: '12-20-2023',
              time: '11:11:11',
              imgUrl: '/assets/images/car.png',
            }
          )
        ),
    },
    {
      latlng: new Leaflet.LatLng(10.780198, 106.762805),
      numOfEvent: 10,
      type: 'static',
      events: Array(20)
        .fill(0)
        .map((e, index) =>
          Object.assign(
            {},
            {
              seen: false,
              boundingBoxes: [],
              date: '12-20-2023',
              time: '11:11:11',
              imgUrl: '/assets/images/car.png',
            }
          )
        ),
    },
    {
      latlng: new Leaflet.LatLng(10.774633, 106.781173),
      numOfEvent: 1,
      type: 'static',
      events: Array(20)
        .fill(0)
        .map((e, index) =>
          Object.assign(
            {},
            {
              seen: false,
              boundingBoxes: [],
              date: '12-20-2023',
              time: '11:11:11',
              imgUrl: '/assets/images/car.png',
            }
          )
        ),
    },
  ];

  _selectedMarker: ExtendedMarker | undefined;

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.markers = this.cameraList.map((e) => {
      const marker = new ExtendedMarker(e.latlng, e, {
        icon: this.createMarkerIcon(e.type, true),
      });

      // marker.on('click', (ev) => {
      //   this._selectedMarker = ev.sourceTarget as ExtendedMarker;
      //   this._modalService
      //     .open(this.eventListDialogTemplateRef, {})
      //     .closed.subscribe(() => (this._selectedMarker = undefined));
      // });

      marker.on('mouseover', (event: Leaflet.LeafletMouseEvent) => {
        const eventComponentRef: ComponentRef<MapEventInfoComponent> =
          this._viewContainerRef.createComponent(MapEventInfoComponent);

        // set data and call detectChanges() to re-render
        // eventComponentRef.instance.data = this.events[0]!;
        eventComponentRef.hostView.detectChanges();

        const marker = event.target as Leaflet.Marker;
        marker.bindPopup(eventComponentRef.location.nativeElement, {
          maxWidth: 400,
          minWidth: 400,
          closeButton: false,
          className: 'event-popup',
        });

        marker.openPopup();
      });

      marker.addTo(this.map!);
      return marker;
    });

    let group = Leaflet.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds());
  }

  mapClicked($event: any) {}

  createMarkerIcon(type: 'ptz' | 'static', isSeen: boolean): Leaflet.DivIcon {
    return Leaflet.divIcon({
      className: `bg-transparent`,
      html:
        type === 'static'
          ? `<div style="border: 3px solid #ff0000; border-radius: 50%; with: 40px; height: 40px; background: #ff2f92ff; display: flex; align-items: center; justify-content: center;"><i class="bi bi-camera-video-fill" style="font-size: 24px; color: white"></i></div>`
          : `<div style="border: 3px solid #ff0000; border-radius: 50%; with: 40px; height: 40px; background: #ff2f92ff; display: flex; align-items: center; justify-content: center;"><img width=24 height=24 src="assets/icons/icons8-dome-camera-32.png"/></div>`,
      iconSize: [40, 40],
    });
  }
}
