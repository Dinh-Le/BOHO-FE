import { Observable } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import {
  CreateResponse,
  FindAllResponse,
  FindResponse,
  ResponseBase,
} from '../schema/boho-v2/response-base';
import { Schedule } from '../schema/boho-v2/shedule';
import { environment } from '@env';
import { Injectable } from '@angular/core';

export type CreateOrUpdateScheduleRequest = Omit<Schedule, 'id'>;

export abstract class ScheduleService extends RestfullApiService {
  public abstract create(
    nodeId: string,
    deviceId: string,
    data: CreateOrUpdateScheduleRequest
  ): Observable<CreateResponse<number>>;
  public abstract findAll(
    nodeId: string,
    deviceId: string
  ): Observable<FindAllResponse<Schedule>>;
  public abstract find(
    nodeId: string,
    deviceId: string,
    scheduleId: string
  ): Observable<FindResponse<Schedule>>;
  public abstract update(
    nodeId: string,
    deviceId: string,
    scheduleId: string,
    data: CreateOrUpdateScheduleRequest
  ): Observable<ResponseBase>;
  public abstract delete(
    nodeId: string,
    deviceId: string,
    scheduleId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class ScheduleServiceImpl extends ScheduleService {
  public override create(
    nodeId: string,
    deviceId: string,
    data: CreateOrUpdateScheduleRequest
  ): Observable<CreateResponse<number>> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/schedule`;
    return this.httpClient.post<CreateResponse<number>>(url, data);
  }
  public override findAll(
    nodeId: string,
    deviceId: string
  ): Observable<FindAllResponse<Schedule>> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/schedule`;
    return this.httpClient.get<FindAllResponse<Schedule>>(url);
  }
  public override find(
    nodeId: string,
    deviceId: string,
    scheduleId: string
  ): Observable<FindResponse<Schedule>> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/schedule/${scheduleId}`;
    return this.httpClient.get<FindResponse<Schedule>>(url);
  }
  public override update(
    nodeId: string,
    deviceId: string,
    scheduleId: string,
    data: CreateOrUpdateScheduleRequest
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/schedule/${scheduleId}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }
  public override delete(
    nodeId: string,
    deviceId: string,
    scheduleId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/schedule/${scheduleId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
