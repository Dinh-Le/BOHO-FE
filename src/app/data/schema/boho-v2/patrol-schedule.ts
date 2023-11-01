export interface PatrolSchedule {
  id: string;
  touring_id: string;
  color: string;
  schedule: {
    start_time: string;
    end_time: string;
    day: string;
  };
}
