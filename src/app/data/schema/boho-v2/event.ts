export declare class EventInfo {
  device_name: string;
  device_location: string;
  device_id: string;
  rule_id: string;
  id: string; // This is tracking id
  start_time: string;
  end_time: string;
  alarm_type: string;
  alarm_level: string;
  image_infos: {
    recognize_result: {
      license_plate: string;
      color: string;
      direction: string;
    }; // only contain value if object is vehicle
    event_type: string;
    event_id: string;
    event_time: string;
  }[];
}
