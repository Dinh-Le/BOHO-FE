import { Preset } from './preset';

export interface Rule {
  rule_id: string;
  snapshot: string;
  tour_level?: number;
  tour_group?: number;
  preset?: Preset;
  camera_id: string;
}
