import { Observable } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import { FindAllResponse, ResponseBase } from '../schema/boho-v2/response-base';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Preset } from '../schema/boho-v2/preset';

export abstract class PresetService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: string
  ): Observable<FindAllResponse<Preset>>;
  public abstract update(
    nodeId: string,
    deviceId: string,
    presetId: number,
    data: Omit<Preset, 'id'>
  ): Observable<ResponseBase>;
  public abstract delete(
    nodeId: string,
    deviceId: string,
    presetId: number
  ): Observable<ResponseBase>;
  public abstract loadFromCamera(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: any[] }>;
}

@Injectable({ providedIn: 'root' })
export class PresetServiceImpl extends PresetService {
  public override findAll(
    nodeId: string,
    deviceId: string
  ): Observable<FindAllResponse<Preset>> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/preset`;
    return this.httpClient.get<FindAllResponse<Preset>>(url);
  }
  public override update(
    nodeId: string,
    deviceId: string,
    presetId: number,
    data: Omit<Preset, 'id'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/preset/${presetId}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }
  public override delete(
    nodeId: string,
    deviceId: string,
    presetId: number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/preset/${presetId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
  public override loadFromCamera(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: any[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/preset/sync`;
    return this.httpClient.get<ResponseBase & { data: any[] }>(url);
  }
}
