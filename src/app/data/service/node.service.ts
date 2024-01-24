import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { Node } from '../schema/boho-v2/node';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';

export type CreateOrUpdateNodeDto = Pick<
  Node,
  'name' | 'type' | 'ip' | 'port' | 'node_metadata' | 'node_operator_id'
>;

export abstract class NodeService extends RestfullApiService {
  abstract findAll(
    nodeOperatorId?: string
  ): Observable<ResponseBase & { data: Node[] }>;
  abstract find(id: string): Observable<ResponseBase & { data: Node }>;
  abstract create(
    data: CreateOrUpdateNodeDto
  ): Observable<ResponseBase & { data: string }>;
  abstract update(
    id: string,
    data: CreateOrUpdateNodeDto
  ): Observable<ResponseBase>;
  abstract delete(id: string): Observable<ResponseBase>;
  abstract sync(nodeId: string): Observable<ResponseBase>;
  abstract ruleUpdate(nodeId: string): Observable<ResponseBase>;
  abstract tourUpdate(nodeId: string): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class NodeServiceImpl extends NodeService {
  override findAll(
    nodeOperatorId?: string | undefined
  ): Observable<ResponseBase & { data: Node[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node`;

    if (nodeOperatorId) {
      const params = new HttpParams().set('npi', nodeOperatorId);

      return this.httpClient.get<ResponseBase & { data: Node[] }>(url, {
        params,
      });
    }

    return this.httpClient.get<ResponseBase & { data: Node[] }>(url);
  }

  override find(id: string): Observable<ResponseBase & { data: Node }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${id}`;
    return this.httpClient.get<ResponseBase & { data: Node }>(url);
  }

  override create(
    data: CreateOrUpdateNodeDto
  ): Observable<ResponseBase & { data: string }> {
    const url = `${environment.baseUrl}/api/rest/v1/node`;
    return this.httpClient.post<ResponseBase & { data: string }>(url, data);
  }

  override update(
    id: string,
    {
      name,
      type,
      ip,
      port,
      node_metadata,
      node_operator_id,
    }: CreateOrUpdateNodeDto
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${id}`;
    return this.httpClient.patch<ResponseBase>(url, {
      name,
      type,
      ip,
      port,
      node_metadata,
      node_operator_id,
      location: {
        lat: '10.8172676',
        long: '106.7824432',
      },
    });
  }

  override delete(id: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${id}`;
    return this.httpClient.delete<ResponseBase>(url);
  }

  override sync(nodeId: string): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }

  override tourUpdate(nodeId: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/tour_update`;
    return this.httpClient.get<ResponseBase>(url);
  }

  override ruleUpdate(nodeId: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/rule_update`;
    return this.httpClient.get<ResponseBase>(url);
  }
}
