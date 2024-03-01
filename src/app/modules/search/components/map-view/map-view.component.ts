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
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { CustomMarker } from '@shared/models/custom-marker';
import { NavigationService } from 'src/app/data/service/navigation.service';
import { Subscription, finalize, tap } from 'rxjs';
import { EventService } from 'src/app/data/service/event.service';
import { ToastService } from '@app/services/toast.service';
import { HttpErrorResponse } from '@angular/common/http';

declare class CameraInfo {
  latlng: LatLng;
  type: 'ptz' | 'static';
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
  private _eventService = inject(EventService);
  private _toastService = inject(ToastService);

  @ViewChild('eventListDialogTemplate')
  eventListDialogTemplateRef!: TemplateRef<any>;

  map: Leaflet.Map | undefined;
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

  _selectedMarker: CustomMarker | undefined;
  subscriptions: Subscription[] = [];

  @Input() events: any[] = [];

  @Input() selectedEvents: any[] = [];
  @Output() selectedEventsChange = new EventEmitter<any[]>();

  get cameraList(): CameraInfo[] {
    return Object.entries(this._navigationService.selectedDeviceIds)
      .flatMap(([_, v]) => Object.values(v))
      .map((device) => {
        const lat = parseFloat(device.location.lat);
        const lng = parseFloat(device.location.long);
        return {
          events: this.events.filter((e) => e.device_id === device.id),
          latlng: new LatLng(lat, lng),
          type: 'ptz',
        };
      });
  }

  get markers(): CustomMarker[] {
    return this.cameraList.map((e) => {
      const marker = new CustomMarker(e.latlng, e, {
        icon: this.createMarkerIcon(e.type, true, e.events.length),
      });

      marker.on('click', (ev) => {
        this._selectedMarker = ev.sourceTarget as CustomMarker;
        this._modalService
          .open(this.eventListDialogTemplateRef, {})
          .closed.subscribe(() => (this._selectedMarker = undefined));
      });

      marker.addTo(this.map!);
      return marker;
    });
  }

  get eventList(): any[] {
    return this._selectedMarker?.data.events || [];
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this._navigationService.selectedDevices$.subscribe(() =>
        this.refresh()
      )
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('events' in changes) {
      this.refresh();
    }

    if (
      'selectedEvents' in changes &&
      changes['selectedEvents'].currentValue.length === 0
    ) {
      this.events = this.events.map((e) =>
        Object.assign(e, { checked: false })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.refresh();
  }

  refresh() {
    if (this.map && this.markers.length > 0) {
      let group = Leaflet.featureGroup(this.markers);
      this.map!.fitBounds(group.getBounds());
    }
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

  createMarkerIcon(
    type: 'ptz' | 'static',
    isSeen: boolean,
    numOfEvent: number = 0
  ): Leaflet.DivIcon {
    return Leaflet.divIcon({
      className: `leaflet-div-icon camera-icon-container`,
      html:
        type === 'static'
          ? `<div class="marker-icon-container me-2 ${
              isSeen ? 'event-seen' : 'event-unseen'
            }"><i class="bi bi-camera-video-fill"></i></div><span>${numOfEvent}<span>`
          : `<div class="marker-icon-container me-2 ${
              isSeen ? 'event-seen' : 'event-unseen'
            }"><img src="assets/icons/icons8-dome-camera-32.png"/></div><span>${numOfEvent}<span>`, // Bootstrap icon class here
      iconSize: [80, 42], // Size of the icon
    });
  }

  closeDialog() {
    this._modalService.dismissAll();
  }

  onEventSelectionChanged() {
    this.selectedEvents = this.events.filter((e) => e.checked);
    this.selectedEventsChange.emit(this.selectedEvents);
  }

  showEventDetail(event: any) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = event;
  }
}
