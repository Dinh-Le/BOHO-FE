import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Touring } from '../schema/boho-v2/touring';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export type CreateOrUpdateTouringScheduleRequest = {
  preset_setting?: {
    preset_id: number;
    color: string;
    schedule: {
      day: number;
      start_time: string;
      end_time: string;
    }[];
  };
  patrol_setting?: {
    patrol_id: number;
    color: string;
    schedule: {
      day: number;
      start_time: string;
      end_time: string;
    }[];
  };
};

export type UpdateTouringScheduleRequest = {
  schedule_type: string;
  color: string;
  schedule: {
    start_time: string;
    end_time: string;
    day: number;
  }[];
};

export type CreateOrUpdateTouringScheduleResponse = ResponseBase & {
  data: {
    id: number;
    type: string;
  };
};

export abstract class TouringService {
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
    id: number
  ): Observable<
    ResponseBase & {
      data: Touring;
    }
  >;

  public abstract createOrUpdateTouringSchedule(
    nodeId: string,
    deviceId: string,
    id: number,
    data: CreateOrUpdateTouringScheduleRequest
  ): Observable<CreateOrUpdateTouringScheduleResponse>;

  public abstract updateTouringSchedule(
    nodeId: string,
    deviceId: string,
    touringId: number,
    scheduleId: number,
    data: UpdateTouringScheduleRequest
  ): Observable<CreateOrUpdateTouringScheduleResponse>;

  public abstract deleteTouringSchedule(
    nodeId: string,
    deviceId: string,
    touringId: number,
    scheduleId: number,
    schedule_type: 'patrol' | 'preset'
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string,
    id: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class TouringServiceImpl extends TouringService {
  httpClient = inject(HttpClient);

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
    id: number
  ): Observable<ResponseBase & { data: Touring }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${id}`;
    return this.httpClient.get<ResponseBase & { data: Touring }>(url);
  }

  public override createOrUpdateTouringSchedule(
    nodeId: string,
    deviceId: string,
    id: number,
    data: CreateOrUpdateTouringScheduleRequest
  ): Observable<CreateOrUpdateTouringScheduleResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${id}/schedule`;
    return this.httpClient.post<CreateOrUpdateTouringScheduleResponse>(
      url,
      data
    );
  }

  public override updateTouringSchedule(
    nodeId: string,
    deviceId: string,
    touringId: number,
    scheduleId: number,
    data: UpdateTouringScheduleRequest
  ): Observable<CreateOrUpdateTouringScheduleResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${touringId}/schedule/${scheduleId}`;
    return this.httpClient.patch<CreateOrUpdateTouringScheduleResponse>(
      url,
      data
    );
  }

  public override deleteTouringSchedule(
    nodeId: string,
    deviceId: string,
    touringId: number,
    scheduleId: number,
    schedule_type: 'patrol' | 'preset'
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/touring/${touringId}/schedule/${scheduleId}`;
    return this.httpClient.delete<ResponseBase>(url, {
      body: {
        schedule_type,
      },
    });
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
