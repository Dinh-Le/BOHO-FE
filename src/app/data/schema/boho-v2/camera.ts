import { ResponseBase } from './response-base';

export interface Camera {
  id: string;
  name: string;
  stream_metadata?: {
    milestone_id: string;
    milestone_url: string;
    is_onvif: boolean;
  }; // Not need to define this field when create request
  manufacture: string; //Camera name (Flexwatch, Hanwha, Sony,...)
  source_pos?: number; // The position of camera on grid
  type: string; // Camera type (PTZ,Static)
}

export interface GetCameraListResponse extends ResponseBase {
  data: Camera;
}

export interface GetCameraResponse extends ResponseBase {
  data: Camera;
}

export interface CreateOrUpdateCameraRequest
  extends Omit<Camera, 'camera_id'> {}
