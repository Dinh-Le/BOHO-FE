import { ResponseBase } from './response-base';

export interface Device {
  id: string;
  node_id: string;
  device_metadata: {
    ip: string;
    http_port: string;
    rtsp_port: string;
    user: string;
    password: string;
  };
  location: {
    lat: string;
    long: string;
  };
  type: string;
  region: string;
}

export interface GetDeviceListResponse extends ResponseBase {
  data: Device[];
}

export interface GetDeviceResponse extends ResponseBase {
  data: Device;
}

export interface CreateOrUpdateDeviceRequest
  extends Omit<Device, 'id|node-id'> {}
