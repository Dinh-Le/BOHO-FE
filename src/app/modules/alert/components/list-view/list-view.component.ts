import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { EventInfo } from '@modules/alert/models';
import { EventDetailComponent } from '@shared/components/event-detail/event-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Leaflet from 'leaflet';
import { NavigationService } from 'src/app/data/service/navigation.service';
import { Subject, Subscription } from 'rxjs';
import { CameraType_PTZ } from 'src/app/data/constants';

@Component({
  selector: 'app-list-view-alert',
  templateUrl: 'list-view.component.html',
  styleUrls: ['list-view.component.scss'],
})
export class ListViewComponent implements OnChanges {
  @HostBinding('class') classNames = 'd-flex flex-column h-100';
  @Input() events: EventInfo[] = [];

  marker?: Leaflet.Marker;
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

  event?: EventInfo;
  eventIndex: number = 0;

  constructor(private _modalService: NgbModal) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('events' in changes && !!changes['events']) {
      if (changes['events'].currentValue.length === 0) {
        this.event = undefined;
        this.updateMap();
      } else if (
        this.eventIndex >= changes['events'].currentValue.length ||
        changes['events'].currentValue[this.eventIndex].data.event_id !=
          this.event?.data.event_id
      ) {
        this.eventIndex = 0;
        this.event = changes['events'].currentValue[0];
        this.updateMap();
      } else {
        // Do nothing
      }
    }
  }

  trackByDetectionId(_: number, event: EventInfo) {
    return event.data.images_info[0].detection_id;
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
  }

  showEventDetail() {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = this.event!.data;
    component.showPresetInfo =
      this.event!.device.camera.type === CameraType_PTZ;
  }

  onEventClick(event: EventInfo, index: number) {
    this.eventIndex = index;
    this.event = event;
    this.updateMap();
  }

  private updateMap() {
    if (this.map) {
      this.marker?.removeFrom(this.map);

      if (!this.event) {
        return;
      }

      const { lat, long } = this.event.data.device_location;
      this.marker = new Leaflet.Marker(
        Leaflet.latLng(parseFloat(lat), parseFloat(long)),
        {
          draggable: false,
          icon: this.createMarkerIcon(this.event.device.camera.type as any),
        }
      );

      this.marker.addTo(this.map);
      this.map.panTo(this.marker.getLatLng());
    }
  }

  private createMarkerIcon(
    type: 'ptz' | 'static' | string,
    isSeen: boolean = false
  ): Leaflet.DivIcon {
    return Leaflet.divIcon({
      className: `bg-transparent`,
      html:
        type.toLocaleLowerCase() === 'static'
          ? `<div style="border: 3px solid #ff0000; border-radius: 50%; with: 40px; height: 40px; background: #ff2f92ff; display: flex; align-items: center; justify-content: center;"><i class="bi bi-camera-video-fill" style="font-size: 24px; color: white"></i></div>`
          : `<div style="border: 3px solid #ff0000; border-radius: 50%; with: 40px; height: 40px; background: #ff2f92ff; display: flex; align-items: center; justify-content: center;"><img width=24 height=24 src="assets/icons/icons8-dome-camera-32.png"/></div>`,
      iconSize: [40, 40],
    });
  }
}
