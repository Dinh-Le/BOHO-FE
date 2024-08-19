import {
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EventInfo } from '@modules/alert/models';
import { EventDetailComponent } from '@shared/components/event-detail/event-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Leaflet from 'leaflet';
import { CameraType_PTZ } from 'src/app/data/constants';
import { environment } from '@env';

@Component({
  selector: 'app-list-view-alert',
  templateUrl: 'list-view.component.html',
  styleUrls: ['list-view.component.scss'],
})
export class ListViewComponent implements OnChanges {
  @HostBinding('class') classNames = 'd-flex flex-column h-100';
  @Input() events: EventInfo[] = [];

  private _marker?: Leaflet.Marker;
  private _map?: Leaflet.Map;
  private readonly _bounds = Leaflet.latLngBounds(
    Leaflet.latLng(
      environment.tilejson.bounds[1],
      environment.tilejson.bounds[0]
    ),
    Leaflet.latLng(
      environment.tilejson.bounds[3],
      environment.tilejson.bounds[2]
    )
  );
  public readonly options: Leaflet.MapOptions = {
    layers: [
      Leaflet.tileLayer(environment.tilejson.tiles[0], {
        attribution: environment.tilejson.attribution,
        minZoom: environment.tilejson.minzoom,
        maxZoom: environment.tilejson.maxzoom,
        bounds: this._bounds,
      }),
    ],
    maxBounds: this._bounds,
    maxBoundsViscosity: 1.0,
    zoom: environment.tilejson.maxzoom,
    center: Leaflet.latLng(
      environment.tilejson.center[1],
      environment.tilejson.center[0],
      environment.tilejson.center[2]
    ),
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
    this._map = map;
    this._map.on('drag', () => {
      this._map!.panInsideBounds(this._bounds, { animate: false });
    });
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
    if (this._map) {
      this._marker?.removeFrom(this._map);

      if (!this.event) {
        return;
      }

      const { lat, long } = this.event.data.device_location;
      this._marker = new Leaflet.Marker(
        Leaflet.latLng(parseFloat(lat), parseFloat(long)),
        {
          draggable: false,
          icon: this.createMarkerIcon(this.event.device.camera.type as any),
        }
      );

      this._marker.addTo(this._map);
      this._map.panTo(this._marker.getLatLng());
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
