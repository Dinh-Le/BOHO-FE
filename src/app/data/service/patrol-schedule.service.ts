import { Observable } from 'rxjs';
import { PatrolSchedule } from '../schema/boho-v2/patrol-schedule';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class PatrolScheduleService {
  public abstract create(
    userId: string,
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
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<
    ResponseBase & {
      data: PatrolSchedule[];
    }
  >;

  public abstract find(
    userId: string,
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
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolSchedule: PatrolSchedule
  ): Observable<ResponseBase>;

  public abstract delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolScheduleId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class PatrolScheduleServiceImpl extends PatrolScheduleService {
  httpClient = inject(HttpClient);

  public override create(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    data: Omit<PatrolSchedule, 'id'>
  ): Observable<ResponseBase & { data: Pick<PatrolSchedule, 'id'> }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule`;
    return this.httpClient.post<
      ResponseBase & { data: Pick<PatrolSchedule, 'id'> }
    >(url, data);
  }

  public override findAll(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<ResponseBase & { data: PatrolSchedule[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule`;
    return this.httpClient.get<ResponseBase & { data: PatrolSchedule[] }>(url);
  }

  public override find(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolScheduleId: string
  ): Observable<ResponseBase & { data: PatrolSchedule }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule/${patrolScheduleId}`;
    return this.httpClient.get<ResponseBase & { data: PatrolSchedule }>(url);
  }

  public override update(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolSchedule: PatrolSchedule
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule/${patrolSchedule.id}`;
    return this.httpClient.patch<ResponseBase>(url, patrolSchedule);
  }

  public override delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolScheduleId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_schedule/${patrolScheduleId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
