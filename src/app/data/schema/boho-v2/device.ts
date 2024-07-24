import { CameraType } from '../../data.types';
import { LatLng } from './latlng';

export interface DeviceMetadata {
  manufacture: string;
  describle: string;
}

export interface OnvifConnectionMetadata {
  ip: string;
  http_port: number;
  rtsp_port: number;
  rtsp_url: string;
  profile: string;
  user: string;
  password: string;
}

export interface RtspConnectionMetadata {
  rtsp_url: string;
  user: string;
  password: string;
}

export interface MilestoneConnectionMetadata {
  ip: string;
  http_port: string;
  rtsp_port: string;
  authen_type: string;
  profile: string;
  user: string;
  password: string;
}

export interface ConnectionMetadata {
  onvif?: OnvifConnectionMetadata;
  rtsp?: RtspConnectionMetadata;
  milestone?: MilestoneConnectionMetadata;
}

export interface Camera {
  driver: string;
  type: CameraType;
  connection_metadata: ConnectionMetadata;
}

export interface Device {
  id: string;
  name: string;
  is_active: boolean;
  meta_data?: DeviceMetadata;
  location: LatLng;
  type: string;
  camera: Camera;
  node_id?: string;
  status?: string;
  address?: string;
  group_info?: {
    group_id: number;
    group_management_id: number;
    group_name: string;
  };
}
