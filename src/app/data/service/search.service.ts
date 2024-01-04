import { Injectable } from '@angular/core';
import { RestfullApiService } from './restful-api.service';
import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { environment } from '@env';
import { HttpParams } from '@angular/common/http';

export interface SearchQuery {
  dis?: string[];
  ot?: string[];
  tq:
    | 'custom'
    | 'day'
    | '5min'
    | '10min'
    | '30min'
    | 'hour'
    | 'week'
    | 'month'
    | 'year';
  eit?: string[];
  start?: string;
  end?: string;
  p: number;
  pl: number;
}

export type SearchEvent = {
  alarm_level: number;
  alarm_type: string;
  created_at: string;
  deleted_at: string | null;
  device_id: number;
  device_location: {
    lat: string;
    long: string;
  };
  device_name: string;
  end_time: string;
  event_id: string;
  images_info: [
    {
      bounding_box: {
        bottomrightx: number;
        bottomrighty: number;
        topleftx: number;
        toplefty: number;
      };
      detection_id: string;
      detection_time: string;
      event_type: string;
      recognize_result: {
        color: string;
        direction: string;
        lisence_plate: string;
        model: string;
      };
    }
  ];
  is_verify: boolean;
  is_watch: boolean;
  record_id?: any;
  rule_id: number;
  start_time: Date;
  tracking_number: number;
  updated_at: Date;
};

export type SearchResultResponse = ResponseBase & {
  data: {
    events: SearchEvent[];
    total: number;
    total_pages: number;
  };
};

export abstract class SearchService extends RestfullApiService {
  public abstract search(
    nodeId: string,
    query: SearchQuery
  ): Observable<SearchResultResponse>;
}

@Injectable({ providedIn: 'root' })
export class SearchServiceImpl extends SearchService {
  public override search(
    nodeId: string,
    query: SearchQuery
  ): Observable<SearchResultResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/events`;
    const params: HttpParams = Object.entries(query).reduce(
      (params, [k, v]) => params.append(k, v),
      new HttpParams()
    );
    return this.httpClient.get<SearchResultResponse>(url, {
      params,
    });
  }
}
