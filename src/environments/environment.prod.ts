export const environment = {
  production: true,
  baseUrl: 'http://10.20.30.250:5500',
  tilejson: {
    tilejson: '2.0.0',
    name: 'Basic preview',
    attribution:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    minzoom: 11,
    maxzoom: 20,
    bounds: [106.458, 10.611, 106.949, 11.021],
    format: 'png',
    type: 'baselayer',
    tiles: ['http://localhost:8888/styles/basic-preview/512/{z}/{x}/{y}.png'],
    center: [106.70349999999999, 10.816, 12],
  },
};
