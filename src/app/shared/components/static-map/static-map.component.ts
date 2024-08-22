import { Component, Input } from '@angular/core';
import { environment } from '@env';
import * as Leaflet from 'leaflet';

@Component({
  selector: 'app-static-map',
  templateUrl: 'static-map.component.html',
})
export class StaticMapComponent {
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

  @Input() locationData: Leaflet.LatLng[] = [];

  private map?: Leaflet.Map;

  onMapReady(map: Leaflet.Map) {
    this.map = map;
    this.map.on('drag', () => {
      this.map!.panInsideBounds(this._bounds, { animate: false });
    });

    const markers = this.locationData.map(
      (location) =>
        new Leaflet.Marker(location, {
          // draggable: true,
          icon: Leaflet.divIcon({
            className: 'border-0',
            html: `<i  class="bi bi-geo-alt-fill text-primary" style="font-size: 48px"></i>`,
            iconSize: [48, 48], // Size of the icon
          }),
        })
    );
    markers.forEach((marker) => marker.addTo(map));
    if (markers.length > 0) {
      const group = Leaflet.featureGroup(markers);
      map.fitBounds(group.getBounds(), {
        padding: [50, 50],
      });
    }
  }
}
