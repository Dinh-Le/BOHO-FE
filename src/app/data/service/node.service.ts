import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BOHOEndpoints } from '../constants/endpoints';
import { GetNodesResponse, UpdateNodeRequest } from '../schema/node';
import { ResponseBase } from '../schema/response-base';

@Injectable({ providedIn: 'root' })
export class NodeService {
  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<GetNodesResponse> {
    return this.httpClient.get<GetNodesResponse>(BOHOEndpoints.node);
  }

  get(id: string) {
    const url = `${BOHOEndpoints.node}/${id}`;
    return this.httpClient.get<GetNodesResponse>(url);
  }

  update(
    id: string,
    updateNodeRequest: UpdateNodeRequest
  ): Observable<ResponseBase> {
    const url = `${BOHOEndpoints.node}/${id}`;
    return this.httpClient.patch<ResponseBase>(url, updateNodeRequest);
  }

  delete(id: string): Observable<ResponseBase> {
    const url = `${BOHOEndpoints.node}/${id}`;
    return this.httpClient.delete<ResponseBase>(url);
  }

  sync(id: string) {
    const url = `${BOHOEndpoints.node}/${id}/sync`;
    return this.httpClient.post<ResponseBase>(url, { id });
  }
}
