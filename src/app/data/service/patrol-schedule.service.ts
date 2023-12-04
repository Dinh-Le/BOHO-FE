import { Observable } from 'rxjs';
import { PatrolSchedule } from '../schema/boho-v2/patrol-schedule';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class PatrolScheduleService {
  public abstract create(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    data: Omit<PatrolSchedule, 'id'>
  ): Observable<
    ResponseBase & {
      data: Pick<PatrolSchedule, 'id'>;
    }
  >;

  public abstract findAll(
    nodeId: string,
    deviceId: string,
    patrolId: number
  ): Observable<
    ResponseBase & {
      data: PatrolSchedule[];
    }
  >;

  public abstract find(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolScheduleId: string
  ): Observable<
    ResponseBase & {
      data: PatrolSchedule;
    }
  >;

  public abstract update(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolSchedule: PatrolSchedule
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string,
    patrolId: number,
    patrolScheduleId: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class PatrolScheduleServiceImpl extends PatrolScheduleService {
  httpClient = inject(HttpClient);

  public override create(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    data: Omit<PatrolSchedule, 'id'>
  ): Observable<ResponseBase & { data: Pick<PatrolSchedule, 'id'> }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule`;
    return this.httpClient.post<
      ResponseBase & { data: Pick<PatrolSchedule, 'id'> }
    >(url, data);
  }

  public override findAll(
    nodeId: string,
    deviceId: string,
    patrolId: number
  ): Observable<ResponseBase & { data: PatrolSchedule[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule`;
    return this.httpClient.get<ResponseBase & { data: PatrolSchedule[] }>(url);
  }

  public override find(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolScheduleId: string
  ): Observable<ResponseBase & { data: PatrolSchedule }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule/${patrolScheduleId}`;
    return this.httpClient.get<ResponseBase & { data: PatrolSchedule }>(url);
  }

  public override update(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolSchedule: PatrolSchedule
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule/${patrolSchedule.id}`;
    return this.httpClient.patch<ResponseBase>(url, patrolSchedule);
  }

  public override delete(
    nodeId: string,
    deviceId: string,
    patrolId: number,
    patrolScheduleId: number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule/${patrolScheduleId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
