import { Nullable } from '@shared/shared.types';

export interface AutoTrackOptions {
  working_time: number;
  timeout: number;
  zoom_level: number;
  roi: number[][];
}

export interface ZoomAndCentralizeOptions {
  zoom_level: number;
  working_time: number;
  pantilt_speed: number;
  zoom_speed: number;
}

export interface ActionOptions {
  auto_track: Nullable<ActionOptions>;
  zoom_and_centralize: Nullable<ZoomAndCentralizeOptions>;
}

export interface Handover {
  id: number;
  device_id: number;
  preset_id: number;
  target_device_id: number;
  action: Nullable<ActionOptions>;
  is_enabled: boolean;
}
