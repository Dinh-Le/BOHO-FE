import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Node } from '../schema/boho-v2/node';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';
import { HttpParams } from '@angular/common/http';
import { environment } from '@env';

export abstract class NodeService extends RestfullApiService {
  abstract findAll(
    userId: string,
    nodeOperatorId?: string
  ): Observable<ResponseBase & { data: Node[] }>;
  abstract find(
    userId: string,
    nodeId: string
  ): Observable<ResponseBase & { data: Node }>;
  abstract create(
    userId: string,
    data: Omit<Node, 'id' | 'node_operator_id' | 'is_active'>
  ): Observable<ResponseBase>;
  abstract update(
    userId: string,
    data: Omit<Node, 'node_operator_id' | 'is_active'>
  ): Observable<ResponseBase>;
  abstract delete(userId: string, nodeId: string): Observable<ResponseBase>;
  abstract sync(nodeId: string): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class NodeServiceImpl extends NodeService {
  override findAll(
    userId: string,
    nodeOperatorId?: string | undefined
  ): Observable<ResponseBase & { data: Node[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node`;

    if (nodeOperatorId) {
      const params = new HttpParams().set('npi', nodeOperatorId);

      return this.httpClient.get<ResponseBase & { data: Node[] }>(url, {
        params,
      });
    }

    return this.httpClient.get<ResponseBase & { data: Node[] }>(url);
  }
  override find(
    userId: string,
    nodeId: string
  ): Observable<ResponseBase & { data: Node }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}`;
    return this.httpClient.get<ResponseBase & { data: Node }>(url);
  }
  override create(
    userId: string,
    data: Omit<Node, 'id' | 'node_operator_id' | 'is_active'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node`;
    return this.httpClient.post<ResponseBase>(url, data);
  }
  override update(
    userId: string,
    data: Omit<Node, 'node_operator_id' | 'is_active'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${data.id}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }
  override delete(userId: string, nodeId: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
  override sync(nodeId: string): Observable<ResponseBase> {
    throw new Error('Method not implemented.');
  }
}
