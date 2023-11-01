import { Observable } from 'rxjs';
import { NodeOperator } from '../schema/boho-v2/node-operator';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export abstract class NodeOperatorService extends RestfullApiService {
  public abstract create(
    userId: string,
    data: Omit<NodeOperator, 'id'>
  ): Observable<ResponseBase>;

  public abstract findAll(
    userId: string
  ): Observable<ResponseBase & { data: NodeOperator[] }>;

  public abstract find(
    userId: string,
    nodeOperatorId: string
  ): Observable<ResponseBase & { data: NodeOperator }>;

  public abstract update(
    userId: string,
    nodeOperator: NodeOperator & { node_id: string }
  ): Observable<ResponseBase>;

  public abstract delete(
    userId: string,
    nodeOperatorId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class NodeOperatorServiceImpl extends NodeOperatorService {
  public override create(
    userId: string,
    data: Omit<NodeOperator, 'id'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node_operator`;
    return this.httpClient.post<ResponseBase>(url, data);
  }

  public override findAll(
    userId: string
  ): Observable<ResponseBase & { data: NodeOperator[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node_operator`;
    return this.httpClient.get<ResponseBase & { data: NodeOperator[] }>(url);
  }

  public override find(
    userId: string,
    nodeOperatorId: string
  ): Observable<ResponseBase & { data: NodeOperator }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node_operator/${nodeOperatorId}`;
    return this.httpClient.get<ResponseBase & { data: NodeOperator }>(url);
  }

  public override update(
    userId: string,
    nodeOperator: NodeOperator & { node_id: string }
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node_operator/${nodeOperator.id}`;
    return this.httpClient.patch<ResponseBase>(url, nodeOperator);
  }

  public override delete(
    userId: string,
    nodeOperatorId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node_operator/${nodeOperatorId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
