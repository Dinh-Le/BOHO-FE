import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Touring } from '../schema/boho-v2/touring';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class TouringService {
  public abstract create(
    nodeId: string,
    deviceId: string,
    data: Omit<Touring, 'id'>
  ): Observable<
    ResponseBase & {
      data: Pick<Touring, 'id'>;
    }
  >;

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
    touring_id: string
  ): Observable<
    ResponseBase & {
      data: Touring;
    }
  >;

  public abstract update(
    nodeId: string,
    deviceId: string,
    touring: Touring
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string,
    touringId: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class TouringServiceImpl extends TouringService {
  httpClient = inject(HttpClient);

  public override create(
    nodeId: string,
    deviceId: string,
    data: Omit<Touring, 'id'>
  ): Observable<ResponseBase & { data: Pick<Touring, 'id'> }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring`;
    return this.httpClient.post<ResponseBase & { data: Pick<Touring, 'id'> }>(
      url,
      data
    );
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
    touring_id: string
  ): Observable<ResponseBase & { data: Touring }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${touring_id}`;
    return this.httpClient.get<ResponseBase & { data: Touring }>(url);
  }

  public override update(
    nodeId: string,
    deviceId: string,
    touring: Touring
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${touring.id}`;
    return this.httpClient.patch<ResponseBase>(url, touring);
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
