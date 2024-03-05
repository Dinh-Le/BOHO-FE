import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { environment } from '@env';
import { HttpParams } from '@angular/common/http';

export abstract class EventService extends RestfullApiService {
  public abstract update(
    nodeId: string,
    deviceId: number,
    eventId: string,
    data: Partial<{
      is_watch: boolean;
      is_verify: boolean;
    }>
  ): Observable<ResponseBase>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    eventId: string
  ): Observable<ResponseBase>;
  public abstract getImage(
    nodeId: string,
    deviceId: string | number,
    eventId: string,
    type: 'full' | 'crop'
  ): Observable<Blob>;
  public abstract verify(
    nodeId: string,
    deviceId: number,
    eventId: string,
    data: Partial<{
      is_verify: boolean;
      is_watch: boolean;
    }>
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class EventServiceImpl extends EventService {
  public override update(
    nodeId: string,
    deviceId: number,
    eventId: string,
    data: Partial<{ is_watch: boolean; is_verify: boolean }>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/event/${eventId}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }

  public override delete(
    nodeId: string,
    deviceId: number,
    eventId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/event/${eventId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }

  public override getImage(
    nodeId: string,
    deviceId: string |number,
    eventId: string,
    type: 'full' | 'crop'
  ): Observable<Blob> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/event/${eventId}/image`;
    const params = new HttpParams().append('type', type);
    return this.httpClient.get(url, { params, responseType: 'blob' });
  }

  public override verify(
    nodeId: string,
    deviceId: number,
    eventId: string,
    data: Partial<{ is_verify: boolean; is_watch: boolean }>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/event/${eventId}/verify_event`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }
}
