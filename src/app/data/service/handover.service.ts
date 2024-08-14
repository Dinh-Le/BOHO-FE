import { map, Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';
import { Handover } from '../schema/boho-v2';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export type CreateHandoverDto = Omit<
  Handover,
  'id' | 'device_id' | 'target_device_id'
>;

export type UpdateHandoverDto = Omit<
  Handover,
  'id' | 'device_id' | 'target_device_id'
> & { handover_id: number };

export abstract class HandoverService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: number
  ): Observable<Handover[]>;
  public abstract find(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<Handover>;
  public abstract create(
    nodeId: string,
    deviceId: number,
    data: CreateHandoverDto[]
  ): Observable<number[]>;
  public abstract update(
    nodeId: string,
    deviceId: number,
    data: UpdateHandoverDto[]
  ): Observable<boolean>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class HandoverServiceImpl extends HandoverService {
  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<Handover[]> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover`;
    return this.httpClient
      .get<ResponseBase & { data: Handover[] }>(url)
      .pipe(map((response) => response.data.sort((a, b) => a.id - b.id)));
  }
  public override find(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<Handover> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient
      .get<ResponseBase & { data: Handover }>(url)
      .pipe(map((response) => response.data));
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: CreateHandoverDto[]
  ): Observable<number[]> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover`;
    return this.httpClient
      .post<ResponseBase & { data: number[] }>(url, {
        handovers: data,
      })
      .pipe(map((response) => response.data));
  }
  public override update(
    nodeId: string,
    deviceId: number,
    data: UpdateHandoverDto[]
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover`;
    return this.httpClient
      .patch<ResponseBase>(url, {
        handovers: data,
      })
      .pipe(map((response) => response.success));
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient
      .delete<ResponseBase>(url)
      .pipe(map((response) => response.success));
  }
}
