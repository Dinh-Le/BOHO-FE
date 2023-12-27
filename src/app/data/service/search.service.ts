import { Injectable } from '@angular/core';
import { RestfullApiService } from './restful-api.service';
import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { EventInfo } from '../schema/boho-v2/event';
import { environment } from '@env';
import { HttpParams } from '@angular/common/http';

export interface SearchQuery {
  dis: string[];
  oit: string[];
  tq: string;
  eit: string[];
  limit: number;
  start: string;
  end: string;
}

export abstract class SearchService extends RestfullApiService {
  public abstract search(
    nodeId: string,
    query: SearchQuery
  ): Observable<ResponseBase & { data: EventInfo[] }>;
}

@Injectable({ providedIn: 'root' })
export class SearchServiceImpl extends SearchService {
  public override search(
    nodeId: string,
    query: SearchQuery
  ): Observable<ResponseBase & { data: EventInfo[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/events`;
    const params: HttpParams = Object.entries(query).reduce(
      (params, [k, v]) => params.append(k, v),
      new HttpParams()
    );
    return this.httpClient.get<ResponseBase & { data: EventInfo[] }>(url, {
      params,
    });
  }
}
