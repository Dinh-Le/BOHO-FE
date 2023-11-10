import { LatLng } from "./latlng";

export interface DeviceMetadata {
  manufacture: string;
  describle: string;
}

export interface OnvifConnectionMetadata {
  ip: string;
  http_port: string;
  rtsp_port: string;
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
  onvif: OnvifConnectionMetadata;
  rtsp: RtspConnectionMetadata;
  milestone: MilestoneConnectionMetadata;
}

export interface Camera {
  driver: string;
  type: string;
  connection_metadata: ConnectionMetadata;
}

export interface Device {
  id: string;
  device_metadata: DeviceMetadata;
  location: LatLng;
  type: string;
  camera: Camera;
}
