import { Injectable, inject } from '@angular/core';
import {
  GetDeviceListResponse,
  CreateOrUpdateDeviceRequest,
  GetDeviceResponse,
} from '../schema/boho-v2/device';
import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { HttpClient } from '@angular/common/http';
import { BOHOEndpoints } from '../schema/boho-v2/endpoints';
import { formatString } from '@app/helpers/function';

export abstract class DeviceData {
  abstract findAll(nodeId: string): Observable<GetDeviceListResponse>;
  abstract find(nodeId: string, id: string): Observable<GetDeviceResponse>;
  abstract create(
    nodeId: string,
    request: CreateOrUpdateDeviceRequest
  ): Observable<ResponseBase>;
  abstract update(
    nodeId: string,
    id: string,
    request: CreateOrUpdateDeviceRequest
  ): Observable<ResponseBase>;
  abstract delete(nodeId: string, id: string): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class DeviceService extends DeviceData {
  private httpClient = inject(HttpClient);

  findAll(nodeId: string): Observable<GetDeviceListResponse> {
    const url = formatString(BOHOEndpoints.devices, [nodeId]);
    return this.httpClient.get<GetDeviceListResponse>(url);
  }

  find(nodeId: string, id: string): Observable<GetDeviceResponse> {
    const url = formatString(BOHOEndpoints.devices, [nodeId, id]);
    return this.httpClient.get<GetDeviceResponse>(url);
  }

  create(
    nodeId: string,
    request: CreateOrUpdateDeviceRequest
  ): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.createDevice, [nodeId]);
    return this.httpClient.post<ResponseBase>(url, request);
  }

  update(
    nodeId: string,
    id: string,
    request: CreateOrUpdateDeviceRequest
  ): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.device, [nodeId, id]);
    return this.httpClient.patch<ResponseBase>(url, request);
  }

  delete(nodeId: string, id: string): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.device, [nodeId, id]);
    return this.httpClient.delete<ResponseBase>(url);
  }
}
