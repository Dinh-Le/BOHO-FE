import { LatLng } from './latlng';

export interface NodeMetadata {
  user: string;
  password: string;
}

export interface KafkaConnectionMetadata {
  port: string;
  topic: string;
}

export interface MQTTConnectionMetadata {
  port: string;
  topic: string;
}

export interface SocketConnectionMetadata {
  port: string;
}

export interface ConnectionMetadata {
  kafka: KafkaConnectionMetadata;
  mqtt: MQTTConnectionMetadata;
  socket: SocketConnectionMetadata;
}

export interface Resolution {
  width: number;
  height: number;
}

export interface Sensitive {
  detection: number;
  tracking: number;
}

export interface EngineMetadata {
  resolution: Resolution;
  frame_rate: number;
  sensitive: Sensitive;
  frame_step: number;
}

export interface Node {
  id: string;
  node_operator_id: string;
  location: LatLng;
  name: string;
  type: string;
  ip: string;
  is_active: boolean;
  node_metadata: NodeMetadata;
  connection_metadata?: ConnectionMetadata;
  engine_metadata?: EngineMetadata;
}
