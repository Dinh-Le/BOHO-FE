export interface PatrolSchedule {
  id: number;
  touring_id: number;
  color: string;
  schedule: {
    start_time: number;
    end_time: number;
    day: number;
  };
}
