import { Point } from '@shared/components/bounding-box-editor/bounding-box-editor.component';

export class ZoomAndFocusOptions {
  zoomInLevel: number = 1;
  trackingDuration: number = 2;
}

export class AutoTrackingOptions {
  pan: number = 3;
  tilt: number = 3;
  waitingTime: number = 5;
  zoomInLevel: number = 1;
  trackingDuration: number = 30;
  roi: Point[] = [];
}
