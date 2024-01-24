export interface Integration {
  id: number;
  service_name: string;
  milestone_id: number;
  guid: string;
  rule_ids: number[];
  is_send_snapshot: boolean;
}
