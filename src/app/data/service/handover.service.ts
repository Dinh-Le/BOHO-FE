import { EMPTY, map, Observable, of, switchMap } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';
import { Handover } from '../schema/boho-v2';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export type CreateHandoverDto = Omit<Handover, 'id' | 'device_id'>;
export type UpdateHandoverDto = Omit<Handover, 'id' | 'device_id'> & {
  handover_id: number;
};
export type CreateHandoverResponse = ResponseBase & { data: number[] };
export type FindAllHandoverResponse = ResponseBase & { data: Handover[] };
export type FindHandoverResponse = ResponseBase & { data: Handover };

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
    handoverId: number,
    data: UpdateHandoverDto
  ): Observable<never>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<never>;
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
      .pipe(map((response) => response.data));
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
    handoverId: number,
    data: UpdateHandoverDto
  ): Observable<never> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient
      .patch<ResponseBase>(url, data)
      .pipe(switchMap((_) => EMPTY));
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<never> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient
      .delete<ResponseBase>(url)
      .pipe(switchMap((_) => EMPTY));
  }
}
