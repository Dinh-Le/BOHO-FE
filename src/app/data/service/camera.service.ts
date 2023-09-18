import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { HttpClient } from '@angular/common/http';
import { BOHOEndpoints } from '../schema/boho-v2/endpoints';
import {
  CreateOrUpdateCameraRequest,
  GetCameraListResponse,
  GetCameraResponse,
} from '../schema/boho-v2/camera';
import { formatString } from '@app/helpers/function';

export abstract class CameraData {
  abstract findAll(
    nodeId: string,
    deviceId: string
  ): Observable<GetCameraListResponse>;
  abstract find(
    nodeId: string,
    deviceId: string,
    id: string
  ): Observable<GetCameraResponse>;
  abstract create(
    nodeId: string,
    deviceId: string,
    request: CreateOrUpdateCameraRequest
  ): Observable<ResponseBase>;
  abstract update(
    nodeId: string,
    deviceId: string,
    id: string,
    request: CreateOrUpdateCameraRequest
  ): Observable<ResponseBase>;
  abstract delete(
    nodeId: string,
    deviceId: string,
    id: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class CameraService extends CameraData {
  private httpClient = inject(HttpClient);

  findAll(nodeId: string, deviceId: string): Observable<GetCameraListResponse> {
    const url = formatString(BOHOEndpoints.cameras, [nodeId, deviceId]);
    return this.httpClient.get<GetCameraListResponse>(url);
  }

  find(
    nodeId: string,
    deviceId: string,
    id: string
  ): Observable<GetCameraResponse> {
    const url = formatString(BOHOEndpoints.camera, [nodeId, deviceId, id]);
    return this.httpClient.get<GetCameraResponse>(url);
  }

  create(
    nodeId: string,
    deviceId: string,
    request: CreateOrUpdateCameraRequest
  ): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.createCamera, [nodeId, deviceId]);
    return this.httpClient.post<ResponseBase>(url, request);
  }

  update(
    nodeId: string,
    deviceId: string,
    id: string,
    request: CreateOrUpdateCameraRequest
  ): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.camera, [nodeId, deviceId, id]);
    return this.httpClient.patch<ResponseBase>(url, request);
  }

  delete(
    nodeId: string,
    deviceId: string,
    id: string
  ): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.camera, [nodeId, deviceId, id]);
    return this.httpClient.delete<ResponseBase>(url);
  }
}
