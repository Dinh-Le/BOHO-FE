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
    loitering?: {
      time_stand: string;
    };
    sobatage?: any;
    tripwire?: {
      direction: 'right to left' | 'left to right' | string;
    };
  };
  objects: string[];
}
