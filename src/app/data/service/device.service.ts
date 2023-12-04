import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Device } from '../schema/boho-v2/device';
import { RestfullApiService } from './restful-api.service';
import { environment } from '@env';
import { HoChiMinhCoord } from '../constants';

export type CreateOrUpdateDeviceRequestDto = Pick<
  Device,
  'name' | 'is_active' | 'type' | 'camera'
>;

export type CreateDeviceResponeDto = ResponseBase & { data: number };

export abstract class DeviceService extends RestfullApiService {
  public abstract create(
    nodeId: string,
    data: CreateOrUpdateDeviceRequestDto
  ): Observable<CreateDeviceResponeDto>;

  public abstract findAll(
    nodeId: string
  ): Observable<ResponseBase & { data: Device[] }>;

  public abstract find(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Device }>;

  public abstract update(
    nodeId: string,
    deviceId: string,
    data: CreateOrUpdateDeviceRequestDto
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class DeviceServiceImpl extends DeviceService {
  public override create(
    nodeId: string,
    { name, is_active, type, camera }: CreateOrUpdateDeviceRequestDto
  ): Observable<CreateDeviceResponeDto> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device`;
    return this.httpClient.post<CreateDeviceResponeDto>(
      url,
      Object.assign(
        {},
        { name, is_active, type, camera },
        {
          location: HoChiMinhCoord,
        }
      )
    );
  }

  public override findAll(
    nodeId: string
  ): Observable<ResponseBase & { data: Device[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device`;
    return this.httpClient.get<ResponseBase & { data: Device[] }>(url);
  }

  public override find(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Device }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}`;
    return this.httpClient.get<ResponseBase & { data: Device }>(url);
  }

  public override update(
    nodeId: string,
    deviceId: string,
    { name, is_active, type, camera }: CreateOrUpdateDeviceRequestDto
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}`;
    return this.httpClient.patch<ResponseBase>(
      url,
      Object.assign(
        {},
        { name, is_active, type, camera },
        {
          location: HoChiMinhCoord,
        }
      )
    );
  }

  public override delete(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
