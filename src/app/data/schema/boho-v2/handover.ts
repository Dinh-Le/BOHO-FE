import { Nullable } from '@shared/shared.types';

export interface AutoTrackOptions {
  roi: number[][];
  pantilt_speed: number;
  timeout: number;
  zoom_level: number;
  zoom_speed: number;
  working_time: number;
}

export interface ZoomAndCentralizeOptions {
  zoom_level: number;
  working_time: number;
}

export interface ActionOptions {
  auto_track?: Nullable<AutoTrackOptions>;
  zoom_and_centralize?: Nullable<ZoomAndCentralizeOptions>;
}

export interface Handover {
  id: number;
  device_id: number;
  target_device_id: number;
  preset_id: number;
  action?: Nullable<ActionOptions>;
  is_enable: boolean;
}

export function getPostActionTypeByHandover(handover: Handover) {
  if (handover.action?.auto_track) {
    return 'auto_track';
  }

  if (handover.action?.zoom_and_centralize) {
    return 'zoom_and_centralize';
  }

  return 'none';
}

export interface HandoverLinking {
  handover_id: number;
  rule_ids: number[];
}
