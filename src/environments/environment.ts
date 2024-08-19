// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: 'http://127.0.0.1:5500',
  googleMapApiKey: 'AIzaSyB582CtlnF_kREmV6TP0DjIDoAVKrmbI80',
  tilejson: {
    tilejson: '2.0.0',
    name: 'Basic preview',
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    minzoom: 0,
    maxzoom: 20,
    bounds: [106.458, 10.611, 106.949, 11.021],
    format: 'png',
    type: 'baselayer',
    tiles: ['http://localhost:8888/styles/basic-preview/512/{z}/{x}/{y}.png'],
    center: [106.70349999999999, 10.816, 12],
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
