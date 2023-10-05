import {
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  inject,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import { EventInfo } from 'src/app/data/schema/event-info';
import { EventComponent } from '../event/event.component';
import { Store } from '@ngrx/store';
import { SidebarState } from 'src/app/state/sidebar.state';
import { Subscription, map } from 'rxjs';
import { Device } from 'src/app/data/schema/boho-v2/device';

class ExtendedMarker extends Leaflet.Marker {
  private _device: Device;

  constructor(
    latLng: L.LatLngExpression,
    device: Device,
    options?: L.MarkerOptions
  ) {
    super(latLng, options);
    this._device = device;
  }

  get device() {
    return this._device;
  }
}

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnDestroy {
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private store = inject(Store<{ sidebar: SidebarState }>);
  private devicesSubscription: Subscription | undefined;

  map: Leaflet.Map | undefined;
  markers: ExtendedMarker[] = [];
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

  ngOnInit(): void {
    this.devicesSubscription = this.store
      .pipe(map(({ sidebar }) => sidebar.devices))
      .subscribe((devices: Device[]) => {
        this.updateDevices(devices);
      });
  }

  ngOnDestroy(): void {
    this.devicesSubscription?.unsubscribe();
  }

  onMapReady($event: Leaflet.Map) {
    this.map = $event;
  }

  mapClicked($event: any) {}

  updateDevices(devices: Device[]) {
    const deviceIds: Set<string> = new Set(devices.map((e) => e.id));
    console.log('deviceIds', deviceIds);

    this.markers = this.markers.reduce((markers: ExtendedMarker[], marker) => {
      if (deviceIds.has(marker.device.id)) {
        markers.push(marker);
      } else {
        marker.remove();
      }

      return markers;
    }, []);

    const existingDeviceIds: Set<string> = new Set(
      this.markers.map((marker) => marker.device.id)
    );

    this.markers = devices
      .filter((device) => !existingDeviceIds.has(device.id))
      .map((device) => {
        const marker = new ExtendedMarker(
          {
            lat: parseFloat(device.location.lat),
            lng: parseFloat(device.location.long),
          },
          device,
          {
            icon: this.createMarkerIcon('PTZ', false),
          }
        );

        marker.on('mouseover', (event: Leaflet.LeafletMouseEvent) => {
          const eventComponentRef: ComponentRef<EventComponent> =
            this.viewContainerRef.createComponent(EventComponent);

          // set data and call detectChanges() to re-render
          eventComponentRef.instance.data = this.events[0]!;
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

        if (this.map) {
          marker.addTo(this.map!);
        }

        return marker;
      })
      .concat(this.markers);

    if (this.markers.length === 0 || !this.map) {
      return;
    }

    let group = Leaflet.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds());
  }

  generateMarker(data: any, index: number) {
    return Leaflet.marker(data.position);
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

  createMarkerIcon(type: string, isSeen: boolean): Leaflet.DivIcon {
    return Leaflet.divIcon({
      className: `leaflet-div-icon camera-icon-container event-${
        isSeen ? 'seen' : 'unseen'
      }`,
      html:
        type === 'Static'
          ? '<i class="bi bi-camera-video-fill"/>'
          : '<img src="assets/icons/icons8-dome-camera-32.png"/>', // Bootstrap icon class here
      iconSize: [28, 28], // Size of the icon
    });
  }
}
