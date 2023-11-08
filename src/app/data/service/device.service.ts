import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Device } from '../schema/boho-v2/device';
import { RestfullApiService } from './restful-api.service';

export abstract class DeviceService extends RestfullApiService {
  public abstract create(
    userId: string,
    nodeId: string,
    device: Omit<Device, 'id'>
  ): Observable<ResponseBase>;
  public abstract findAll(
    userId: string,
    nodeId: string
  ): Observable<ResponseBase & { data: Device[] }>;
  public abstract find(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Device }>;
  public abstract update(
    userId: string,
    nodeId: string,
    device: Device
  ): Observable<ResponseBase>;
  public abstract delete(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class DeviceServiceImpl extends DeviceService {
  public override create(
    userId: string,
    nodeId: string,
    device: Omit<Device, 'id'>
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/node/${nodeId}/device`;
    return this.httpClient.post<ResponseBase>(url, device);
  }
  public override findAll(
    userId: string,
    nodeId: string
  ): Observable<ResponseBase & { data: Device[] }> {
    const url = `/api/rest/v1/user/${userId}/node/${nodeId}/device`;
    return this.httpClient.get<ResponseBase & { data: Device[] }>(url);
  }
  public override find(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Device }> {
    const url = `/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}`;
    return this.httpClient.get<ResponseBase & { data: Device }>(url);
  }
  public override update(
    userId: string,
    nodeId: string,
    device: Device
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/node/${nodeId}/device/${device.id}`;
    return this.httpClient.patch<ResponseBase>(url, device);
  }
  public override delete(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
