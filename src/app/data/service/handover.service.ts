import { Observable, of } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';
import { Handover } from '../schema/boho-v2';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export type CreateOrUpdateHandoverRequest = Omit<Handover, 'id' | 'device_id'>;
export type CreateHandoverResponse = ResponseBase & { data: { id: number } };
export type FindAllHandoverResponse = ResponseBase & { data: Handover[] };
export type FindHandoverResponse = ResponseBase & { data: Handover };

export abstract class HandoverService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: number
  ): Observable<FindAllHandoverResponse>;
  public abstract find(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<FindHandoverResponse>;
  public abstract create(
    nodeId: string,
    deviceId: number,
    data: CreateOrUpdateHandoverRequest
  ): Observable<CreateHandoverResponse>;
  public abstract update(
    nodeId: string,
    deviceId: number,
    handoverId: number,
    data: CreateOrUpdateHandoverRequest
  ): Observable<ResponseBase>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class HandoverServiceImpl extends HandoverService {
  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<FindAllHandoverResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover`;
    return this.httpClient.get<FindAllHandoverResponse>(url);
  }
  public override find(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<FindHandoverResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient.get<FindHandoverResponse>(url);
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: CreateOrUpdateHandoverRequest
  ): Observable<CreateHandoverResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover`;
    return this.httpClient.post<CreateHandoverResponse>(url, data);
  }
  public override update(
    nodeId: string,
    deviceId: number,
    handoverId: number,
    data: CreateOrUpdateHandoverRequest
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient.patch<CreateHandoverResponse>(url, data);
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover/${handoverId}`;
    return this.httpClient.delete<CreateHandoverResponse>(url);
  }
}

@Injectable({ providedIn: 'root' })
export class HandoverServiceMockImpl extends HandoverService {
  items: Handover[] = [];

  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<FindAllHandoverResponse> {
    return of({
      success: true,
      message: 'success',
      data: this.items,
    } as FindAllHandoverResponse);
  }
  public override find(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<FindHandoverResponse> {
    const item = this.items.find((item) => item.id === handoverId);
    return of({
      success: true,
      message: 'success',
      data: item,
    } as FindHandoverResponse);
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: CreateOrUpdateHandoverRequest
  ): Observable<CreateHandoverResponse> {
    console.log('Create new item: ', data);
    const id = this.items.length + 1;
    this.items.push({
      id,
      device_id: deviceId,
      is_enabled: data.is_enabled,
      preset_id: data.preset_id,
      target_device_id: data.target_device_id,
      action: data.action,
    });

    return of({
      success: true,
      message: 'success',
      data: {
        id,
      },
    } as CreateHandoverResponse);
  }
  public override update(
    nodeId: string,
    deviceId: number,
    handoverId: number,
    data: CreateOrUpdateHandoverRequest
  ): Observable<ResponseBase> {
    console.log('Update item: ', handoverId, data);
    const item = this.items.find((item) => item.id === handoverId);
    if (item) {
      item.device_id = deviceId;
      item.is_enabled = data.is_enabled;
      item.preset_id = data.preset_id;
      item.target_device_id = data.target_device_id;
      item.action = data.action;
    }

    return of({
      success: true,
      message: 'success',
    } as ResponseBase);
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    handoverId: number
  ): Observable<ResponseBase> {
    console.log('Delete item: ', handoverId);
    this.items = this.items.filter((item) => item.id !== handoverId);

    return of({
      success: true,
      message: 'success',
    } as ResponseBase);
  }
}
