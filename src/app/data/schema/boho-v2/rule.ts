export interface Rule {
  id: string;
  name: string;
  combine_name: string;
  active: boolean;
  post_action: any;
  alarm_type: string;
  points: number[][];
  level: string;
  alarm_metadata: {
    loitering: {
      time_stand: string;
    };
    sobatage: any;
  };
  objects: number[];
}
