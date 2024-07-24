import { TripwireDirectionType } from '../../data.types';

export interface LoiteringOptions {
  time_stand: number;
}

export interface SabotageOptions {
  fov_sensitive: number;
  occlusion_sensitive: number;
  defocus_sensitive: number;
}

export interface TripwireOptions {
  direction: TripwireDirectionType;
}

export interface LostOptions {
  losing_time: number;
  sensitive: number;
}

export interface AbandonOptions {
  abandon_time: number;
  sensitive: number;
}

export interface Rule {
  id: number;
  name: string;
  combine_name: string;
  active: boolean;
  post_action?: any;
  alarm_type: string;
  points: number[][];
  level: number;
  preset_id: number;
  schedule_id: number;
  alarm_metadata: {
    loitering?: LoiteringOptions;
    sobatage?: SabotageOptions;
    tripwire?: TripwireOptions;
    lost?: LostOptions;
    abandon?: AbandonOptions;
  };
  objects: string[];
}
