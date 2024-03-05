import {
  Component,
  ComponentRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  inject,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapEventInfoComponent } from './map-event-info/map-event-info.component';
import { NavigationService } from 'src/app/data/service/navigation.service';
import { Subscription } from 'rxjs';
import { EventInfo } from '@modules/alert/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventDetailComponent } from '@shared/components/event-detail/event-detail.component';

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
export class MapViewComponent implements OnInit, OnDestroy {
  @HostBinding('class') classNames = 'd-flex h-100';

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

  @Input() events: EventInfo[] = [];

  _selectedMarker: ExtendedMarker | undefined;
  private _subscriptions: Subscription[] = [];

  constructor(
    private navigationService: NavigationService,
    private _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const selectedDevicesSubscription =
      this.navigationService.selectedDevices$.subscribe((devices) => {
        this.update(devices);
      });
    this._subscriptions.push(selectedDevicesSubscription);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.update(this.navigationService.selectedDevices$.getValue());
  }

  createMarkerIcon(type: 'ptz' | 'static', isSeen: boolean): Leaflet.DivIcon {
    return Leaflet.divIcon({
      className: `bg-transparent`,
      html:
        type.toLocaleLowerCase() === 'static'
          ? `<div style="border: 3px solid #ff0000; border-radius: 50%; with: 40px; height: 40px; background: #ff2f92ff; display: flex; align-items: center; justify-content: center;"><i class="bi bi-camera-video-fill" style="font-size: 24px; color: white"></i></div>`
          : `<div style="border: 3px solid #ff0000; border-radius: 50%; with: 40px; height: 40px; background: #ff2f92ff; display: flex; align-items: center; justify-content: center;"><img width=24 height=24 src="assets/icons/icons8-dome-camera-32.png"/></div>`,
      iconSize: [40, 40],
    });
  }

  update(devices: any[]) {
    if (!this.map) {
      return;
    }

    // Remove all markers
    this.map.eachLayer((layer) => {
      if (layer instanceof Leaflet.Marker) {
        layer.remove();
      }
    });

    const markers = devices.map((device) => {
      const marker = new ExtendedMarker(
        {
          lat: parseFloat(device.location.lat),
          lng: parseFloat(device.location.long),
        },
        device,
        {
          icon: this.createMarkerIcon(device.camera.type, true),
        }
      );

      marker.on(
        'mouseover',
        ({ target: marker }: Leaflet.LeafletMouseEvent) => {
          const event = this.events.find(
            (event) => event.device?.id === device.id
          );

          if (!event) {
            return;
          }

          const eventComponentRef: ComponentRef<MapEventInfoComponent> =
            this._viewContainerRef.createComponent(MapEventInfoComponent);

          // set data and call detectChanges() to re-render
          eventComponentRef.setInput('event', event);
          eventComponentRef.hostView.detectChanges();

          marker.bindPopup(eventComponentRef.location.nativeElement, {
            maxWidth: 400,
            minWidth: 400,
            closeButton: false,
            className: 'event-popup',
          });
          marker.openPopup();
        }
      );

      return marker;
    });

    markers.forEach((marker) => marker.addTo(this.map!));

    if (markers.length > 0) {
      const group = Leaflet.featureGroup(markers);
      this.map.fitBounds(group.getBounds(), {
        padding: [50, 50],
      });
    }
  }

  trackByDetectionId(_: number, item: EventInfo) {
    return item.data.images_info[0].detection_id;
  }

  showDetailedEvent(event: EventInfo) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = event.data;
  }
}
