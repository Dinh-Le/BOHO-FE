import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import { LatLng } from 'leaflet';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomMarker } from '@shared/models/custom-marker';
import { NavigationService } from 'src/app/data/service/navigation.service';
import { Subscription } from 'rxjs';
import { EventData } from '@modules/search/models';
import { Device } from 'src/app/data/schema/boho-v2';

declare class CameraInfo {
  latlng: LatLng;
  type: 'ptz' | 'static' | string;
  events: any[];
}

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnChanges, OnDestroy {
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _markers: CustomMarker[] = [];
  private map?: Leaflet.Map;

  @ViewChild('eventListDialogTemplate')
  eventListDialogTemplateRef!: TemplateRef<any>;

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

  deviceEvents: EventData[] = [];
  subscriptions: Subscription[] = [];
  selectedDevice?: Device;

  @Input() events: EventData[] = [];
  @Output() onClick = new EventEmitter<EventData>();
  @Output() onChange = new EventEmitter<EventData>();

  ngOnInit(): void {
    this.updateMarkers(this._navigationService.selectedDevices$.getValue());

    this.subscriptions.push(
      this._navigationService.selectedDevices$.subscribe((devices) =>
        this.updateMarkers(devices)
      )
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('events' in changes) {
      this.updateEventCount();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.showMarkersOnMap();
  }

  closeDialog() {
    this._modalService.dismissAll();
  }

  private updateMarkers(devices: Device[]) {
    this._markers.forEach((marker) => {
      if (this.map) {
        marker.removeFrom(this.map);
      }

      marker.removeEventListener('click');
    });

    this._markers = devices.map((device) => {
      const lat = parseFloat(device.location.lat);
      const lng = parseFloat(device.location.long);
      return new CustomMarker({ lat, lng }, device);
    });

    this._markers.forEach((marker) => {
      marker.addEventListener('click', this.onMarkerClick.bind(this));
    });

    this.updateEventCount();

    this.showMarkersOnMap();
  }

  private updateEventCount() {
    this._markers.forEach((marker) => {
      const eventCount = this.events.reduce(
        (count, event) => count + +(event.data.device_id === marker.data.id),
        0
      );
      marker.setIcon(this.createMarkerIcon(marker.data.type, true, eventCount));
    });
  }

  private showMarkersOnMap() {
    if (this.map && this._markers.length > 0) {
      this._markers.forEach((marker) => marker.addTo(this.map!));
      const group = Leaflet.featureGroup(this._markers);
      this.map.fitBounds(group.getBounds(), {
        padding: [50, 50],
      });
    }
  }

  private onMarkerClick({ sourceTarget }: Leaflet.LeafletMouseEvent) {
    this.selectedDevice = sourceTarget.data as Device;
    this.deviceEvents = this.events.filter(
      (event) => event.data.device_id === (this.selectedDevice!.id as any)
    );
    this._modalService.open(this.eventListDialogTemplateRef);
  }

  private createMarkerIcon(
    type: 'ptz' | 'static' | string,
    isSeen: boolean,
    numOfEvent: number = 0
  ): Leaflet.DivIcon {
    return Leaflet.divIcon({
      className: `leaflet-div-icon camera-icon-container`,
      html:
        type.toLocaleLowerCase() === 'static'
          ? `<div class="marker-icon-container me-2 ${
              isSeen ? 'event-seen' : 'event-unseen'
            }"><i class="bi bi-camera-video-fill"></i></div><span>${numOfEvent}<span>`
          : `<div class="marker-icon-container me-2 ${
              isSeen ? 'event-seen' : 'event-unseen'
            }"><img src="assets/icons/icons8-dome-camera-32.png"/></div><span>${numOfEvent}<span>`, // Bootstrap icon class here
      iconSize: [80, 42], // Size of the icon
    });
  }
}
