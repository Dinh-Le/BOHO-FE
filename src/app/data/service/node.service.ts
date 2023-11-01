import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BOHOEndpoints } from '../schema/boho-v2/endpoints';
import {
  CreateNodeRequest,
  GetNodesResponse,
  NodeDetailedResponse,
  UpdateNodeRequest,
} from '../schema/boho-v2/node';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { formatString } from '@app/helpers/function';
import { RestfullApiService } from './restful-api.service';

export abstract class NodeManagementService extends RestfullApiService {
  abstract findAll(): Observable<GetNodesResponse>;
  abstract find(id: string): Observable<NodeDetailedResponse>;
  abstract create(request: CreateNodeRequest): Observable<ResponseBase>;
  abstract update(
    id: string,
    updateNodeRequest: UpdateNodeRequest
  ): Observable<ResponseBase>;
  abstract delete(id: string): Observable<ResponseBase>;
  abstract sync(id: string): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class NodeManagementServiceImpl extends NodeManagementService {
  findAll(): Observable<GetNodesResponse> {
    return this.httpClient.get<GetNodesResponse>(BOHOEndpoints.nodes);
  }

  find(id: string): Observable<NodeDetailedResponse> {
    const url = formatString(BOHOEndpoints.node, [id]);
    return this.httpClient.get<NodeDetailedResponse>(url);
  }

  create(request: CreateNodeRequest): Observable<ResponseBase> {
    return this.httpClient.post<ResponseBase>(
      BOHOEndpoints.createNode,
      request
    );
  }

  update(
    id: string,
    updateNodeRequest: UpdateNodeRequest
  ): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.node, [id]);
    return this.httpClient.patch<ResponseBase>(url, updateNodeRequest);
  }

  delete(id: string): Observable<ResponseBase> {
    const url = formatString(BOHOEndpoints.node, [id]);
    return this.httpClient.delete<ResponseBase>(url);
  }

  sync(id: string): Observable<ResponseBase> {
    const url = `${formatString(BOHOEndpoints.node, [id])}/sync`;
    return this.httpClient.post<ResponseBase>(url, { id });
  }
}
