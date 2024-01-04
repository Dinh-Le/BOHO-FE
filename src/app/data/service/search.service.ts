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

export type SearchResultResponse = ResponseBase & {
  data: {
    events: {
      alarm_level: number;
      alarm_type: 'TRESPASSING EVENT';
      created_at: Date;
      deleted_at?: Date;
      device_id: 14;
      device_location: {
        lat: string;
        long: string;
      };
      device_name: string;
      end_time: Date;
      id: string;
      images_info: [
        {
          bounding_box: {
            bottomrightx: number;
            bottomrighty: number;
            topleftx: number;
            toplefty: number;
          };
          event_id: string;
          event_time: Date;
          event_type: 'Car';
          is_verify: boolean;
          is_watch: boolean;
          recognize_result: {
            color: string;
            direction: string;
            lisence_plate: string;
            model: string;
          };
        }
      ];
      record_id?: any;
      rule_id: number;
      start_time: Date;
      tracking_number: number;
      updated_at: Date;
    }[];
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
