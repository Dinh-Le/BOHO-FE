export interface Touring {
  id: number;
  device_id: number;
  active: boolean;
  preset_setting: {
    preset_id: number;
    color: string;
    preset_schedule_id: number;
    schedule: {
      day: number;
      start_time: string;
      end_time: string;
    }[];
  }[];
  patrol_setting: {
    patrol_id: number;
    patrol_schedule_id: number;
    color: string;
    schedule: {
      day: number;
      start_time: string;
      end_time: string;
    }[];
  }[];
}
