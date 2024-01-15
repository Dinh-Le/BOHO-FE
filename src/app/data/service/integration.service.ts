import { Observable } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Integration } from '../schema/boho-v2';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export abstract class IntegrationService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: number
  ): Observable<ResponseBase & { data: Integration[] }>;
  public abstract create(
    nodeId: string,
    deviceId: number,
    data: Omit<Integration, 'id'>
  ): Observable<ResponseBase & { data: number }>;
  public abstract update(
    nodeId: string,
    deviceId: number,
    integrationId: number,
    data: Omit<Integration, 'id'>
  ): Observable<ResponseBase>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    integrationId: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class IntegrationServiceImpl extends IntegrationService {
  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<ResponseBase & { data: Integration[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/intergrate`;
    return this.httpClient.get<ResponseBase & { data: Integration[] }>(url);
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: Omit<Integration, 'id'>
  ): Observable<ResponseBase & { data: number }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/intergrate`;
    return this.httpClient.post<ResponseBase & { data: number }>(
      url,
      Object.assign({}, data, {
        id: undefined,
      })
    );
  }
  public override update(
    nodeId: string,
    deviceId: number,
    integrationId: number,
    data: Omit<Integration, 'id'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/intergrate/${integrationId}`;
    return this.httpClient.patch<ResponseBase>(
      url,
      Object.assign({}, data, {
        id: undefined,
      })
    );
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    integrationId: number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/intergrate/${integrationId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
