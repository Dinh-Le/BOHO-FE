export interface Schedule {
  id: number;
  name: string;
  time_info: {
    day: number;
    start_time: string; // Format: "%H:%M:%S"
    end_time: string; // Format: "%H:%M:%S"
  }[];
}
