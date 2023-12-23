import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import * as Leaflet from 'leaflet';
import { Store } from '@ngrx/store';
import { SidebarState } from 'src/app/state/sidebar.state';
import { Subscription } from 'rxjs';
import { Device } from 'src/app/data/schema/boho-v2/device';
import { LatLng } from 'leaflet';
import { NgModel } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventInfo } from 'src/app/data/schema/event-info';

class ExtendedMarker extends Leaflet.Marker {
  private _camera: CameraInfo;

  constructor(
    latLng: L.LatLngExpression,
    camera: CameraInfo,
    options?: L.MarkerOptions
  ) {
    super(latLng, options);
    this._camera = camera;
  }

  get camera() {
    return this._camera;
  }
}

declare class CameraInfo {
  latlng: LatLng;
  type: 'ptz' | 'static';
  numOfEvent: number;
  events: MyEventInfo[];
}

declare class MyEventInfo {
  seen: boolean;
  boundingBoxes: number[][];
  date: string;
  time: string;
  imgUrl: string;
  checkboxVisible?: boolean;
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
  private _modalService = inject(NgbModal);

  @ViewChild('eventListDialogTemplate')
  eventListDialogTemplateRef!: TemplateRef<any>;

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

  cameraList: CameraInfo[] = [
    {
      latlng: new LatLng(10.769906, 106.775626),
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
      latlng: new LatLng(10.780198, 106.762805),
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
      latlng: new LatLng(10.774633, 106.781173),
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

  ngOnInit(): void {
    // this.devicesSubscription = this.store
    //   .pipe(map(({ sidebar }) => sidebar.devices))
    //   .subscribe((devices: Device[]) => {
    //     this.updateDevices(devices);
    //   });
  }

  ngOnDestroy(): void {
    this.devicesSubscription?.unsubscribe();
  }

  _selectedMarker: ExtendedMarker | undefined;

  get eventList(): MyEventInfo[] {
    return this._selectedMarker?.camera.events || [];
  }

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.markers = this.cameraList.map((e) => {
      const marker = new ExtendedMarker(e.latlng, e, {
        icon: this.createMarkerIcon(e.type, true),
      });

      marker.on('click', (ev) => {
        this._selectedMarker = ev.sourceTarget as ExtendedMarker;
        this._modalService
          .open(this.eventListDialogTemplateRef, {})
          .closed.subscribe(() => (this._selectedMarker = undefined));
      });

      // marker.on('mouseover', (event: Leaflet.LeafletMouseEvent) => {
      //   const eventComponentRef: ComponentRef<EventComponent> =
      //     this.viewContainerRef.createComponent(EventComponent);

      //   // set data and call detectChanges() to re-render
      //   eventComponentRef.instance.data = this.events[0]!;
      //   eventComponentRef.hostView.detectChanges();

      //   const marker = event.target as Leaflet.Marker;
      //   marker.bindPopup(eventComponentRef.location.nativeElement, {
      //     maxWidth: 500,
      //     minWidth: 500,
      //     closeButton: false,
      //     className: 'event-popup',
      //   });

      //   marker.openPopup();
      // });

      marker.addTo(this.map!);
      return marker;
    });

    let group = Leaflet.featureGroup(this.markers);
    this.map.fitBounds(group.getBounds());
  }

  mapClicked($event: any) {}

  // updateDevices(devices: Device[]) {
  //   const deviceIds: Set<string> = new Set(devices.map((e) => e.id));
  //   console.log('deviceIds', deviceIds);

  //   this.markers = this.markers.reduce((markers: ExtendedMarker[], marker) => {
  //     if (deviceIds.has(marker.device.id)) {
  //       markers.push(marker);
  //     } else {
  //       marker.remove();
  //     }

  //     return markers;
  //   }, []);

  //   const existingDeviceIds: Set<string> = new Set(
  //     this.markers.map((marker) => marker.device.id)
  //   );

  //   this.markers = devices
  //     .filter((device) => !existingDeviceIds.has(device.id))
  //     .map((device) => {
  //       const marker = new ExtendedMarker(
  //         {
  //           lat: parseFloat(device.location.lat),
  //           lng: parseFloat(device.location.long),
  //         },
  //         device,
  //         {
  //           icon: this.createMarkerIcon('PTZ', false),
  //         }
  //       );

  //       marker.on('mouseover', (event: Leaflet.LeafletMouseEvent) => {
  //         const eventComponentRef: ComponentRef<EventComponent> =
  //           this.viewContainerRef.createComponent(EventComponent);

  //         // set data and call detectChanges() to re-render
  //         eventComponentRef.instance.data = this.events[0]!;
  //         eventComponentRef.hostView.detectChanges();

  //         const marker = event.target as Leaflet.Marker;
  //         marker.bindPopup(eventComponentRef.location.nativeElement, {
  //           maxWidth: 500,
  //           minWidth: 500,
  //           closeButton: false,
  //           className: 'event-popup',
  //         });

  //         marker.openPopup();
  //       });

  //       if (this.map) {
  //         marker.addTo(this.map!);
  //       }

  //       return marker;
  //     })
  //     .concat(this.markers);

  //   if (this.markers.length === 0 || !this.map) {
  //     return;
  //   }

  //   let group = Leaflet.featureGroup(this.markers);
  //   this.map.fitBounds(group.getBounds());
  // }

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

  onSeenCheckboxChanged(event: MyEventInfo) {}
}
