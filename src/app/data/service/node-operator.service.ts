import { Observable } from 'rxjs';
import { NodeOperator } from '../schema/boho-v2/node-operator';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export abstract class NodeOperatorService extends RestfullApiService {
  public abstract create(
    data: Pick<NodeOperator, 'name'>
  ): Observable<ResponseBase & { data: string }>;

  public abstract findAll(): Observable<
    ResponseBase & { data: NodeOperator[] }
  >;

  public abstract find(
    id: string
  ): Observable<ResponseBase & { data: NodeOperator }>;

  public abstract update(data: NodeOperator): Observable<ResponseBase>;

  public abstract delete(id: string): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class NodeOperatorServiceImpl extends NodeOperatorService {
  public override create({
    name,
  }: Pick<NodeOperator, 'name'>): Observable<ResponseBase & { data: string }> {
    const url = `${environment.baseUrl}/api/rest/v1/node_operator`;
    return this.httpClient.post<ResponseBase & { data: string }>(url, {
      name,
      describle: '',
    });
  }

  public override findAll(): Observable<
    ResponseBase & { data: NodeOperator[] }
  > {
    const url = `${environment.baseUrl}/api/rest/v1/node_operator`;
    return this.httpClient.get<ResponseBase & { data: NodeOperator[] }>(url);
  }

  public override find(
    id: string
  ): Observable<ResponseBase & { data: NodeOperator }> {
    const url = `${environment.baseUrl}/api/rest/v1/node_operator/${id}`;
    return this.httpClient.get<ResponseBase & { data: NodeOperator }>(url);
  }

  public override update({ id, name }: NodeOperator): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node_operator/${id}`;
    return this.httpClient.patch<ResponseBase>(url, { name, describle: '' });
  }

  public override delete(id: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node_operator/${id}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
