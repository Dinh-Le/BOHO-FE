export interface Touring {
  id: number;
  type: string;
  active: boolean;
  color: string;
  schedule: {
    start_time: string;
    end_time: string;
    day: string;
  };
  preset_id?: string;
  patrol_id?: string;
}
