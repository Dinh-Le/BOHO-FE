import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Touring } from '../schema/boho-v2/touring';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

type CreateOrUpdateTouringRequest = Omit<Touring, 'id'>;
type CreateTouringResponse = ResponseBase & { data: number };

export abstract class TouringService {
  public abstract create(
    nodeId: string,
    deviceId: string,
    data: CreateOrUpdateTouringRequest
  ): Observable<CreateTouringResponse>;

  public abstract findAll(
    nodeId: string,
    deviceId: string
  ): Observable<
    ResponseBase & {
      data: Touring[];
    }
  >;

  public abstract find(
    nodeId: string,
    deviceId: string,
    id: number
  ): Observable<
    ResponseBase & {
      data: Touring;
    }
  >;

  public abstract update(
    nodeId: string,
    deviceId: string,
    id: number,
    data: CreateOrUpdateTouringRequest
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string,
    id: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class TouringServiceImpl extends TouringService {
  httpClient = inject(HttpClient);

  public override create(
    nodeId: string,
    deviceId: string,
    data: CreateOrUpdateTouringRequest
  ): Observable<CreateTouringResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring`;
    return this.httpClient.post<CreateTouringResponse>(url, data);
  }

  public override findAll(
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Touring[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring`;
    return this.httpClient.get<ResponseBase & { data: Touring[] }>(url);
  }

  public override find(
    nodeId: string,
    deviceId: string,
    id: number
  ): Observable<ResponseBase & { data: Touring }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${id}`;
    return this.httpClient.get<ResponseBase & { data: Touring }>(url);
  }

  public override update(
    nodeId: string,
    deviceId: string,
    id: number,
    data: CreateOrUpdateTouringRequest
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${id}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }

  public override delete(
    nodeId: string,
    deviceId: string,
    touringId: number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${touringId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
