import * as Leaflet from 'leaflet';

export class CustomMarker extends Leaflet.Marker {
  private _data: any;

  constructor(
    latLng: L.LatLngExpression,
    data: any,
    options?: L.MarkerOptions
  ) {
    super(latLng, options);
    this._data = data;
  }

  public get data(): any {
    return this._data;
  }
}
