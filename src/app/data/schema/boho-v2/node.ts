import { ResponseBase } from './response-base';

export interface NodeMetadata {
  user: string;
  password: string;
  end_point: string;
}

export interface ConnectionMetadata {
  kafka: {
    port: string;
    topic: string;
  };
  mqtt: {
    port: string;
    topic: string;
  };
  socket: {
    port: string;
  };
}

export interface EngineMetadata {
  resolution: {
    width: number;
    height: number;
  };
  frame_rate: number;
  sensitive: {
    detection: number;
    tracking: number;
  };
  frame_step: number;
}

export interface Node {
  id: string;
  location: {
    lat: string;
    lon: string;
  };
  name: string;
  type: string;
  ip: string;
  node_metadata: NodeMetadata;
  connection_metadata: ConnectionMetadata;
  engine_metadata: EngineMetadata;
}

export interface CreateNodeRequest extends Omit<Node, 'id'> {}

export interface UpdateNodeRequest extends Omit<Node, 'node_metadata'> {
  node_metadata: {
    stream_port: string;
    stream_url: string;
    image_stream_url: string;
    imaeg_stream_port: string;
  };
}

export interface GetNodesResponse extends ResponseBase {
  data: Node[];
}

export interface NodeDetailedResponse extends ResponseBase {
  data: {
    code: number;
    message: string;
    data: Node;
  };
}
