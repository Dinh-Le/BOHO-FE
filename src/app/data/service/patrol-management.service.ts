import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { PatrolManagement } from '../schema/boho-v2/patrol-management';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { RestfullApiService } from './restful-api.service';

export type CreatePatrolManagementDto = Omit<
  PatrolManagement,
  'id' | 'patrol_id'
>;

export abstract class PatrolManagementService extends RestfullApiService {
  public abstract create(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    data: CreatePatrolManagementDto[]
  ): Observable<
    ResponseBase & {
      data: Pick<PatrolManagement, 'id'>;
    }
  >;
  public abstract findAll(
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<
    ResponseBase & {
      data: PatrolManagement[];
    }
  >;
  public abstract find(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<
    ResponseBase & {
      data: PatrolManagement;
    }
  >;
  public abstract delete(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class PatrolManagementServiceImpl extends PatrolManagementService {
  public override create(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    data: CreatePatrolManagementDto[]
  ): Observable<ResponseBase & { data: Pick<PatrolManagement, 'id'> }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management`;
    return this.httpClient.post<
      ResponseBase & { data: Pick<PatrolManagement, 'id'> }
    >(url, data);
  }

  override findAll(
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<ResponseBase & { data: PatrolManagement[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management`;
    return this.httpClient.get<ResponseBase & { data: PatrolManagement[] }>(
      url
    );
  }

  override find(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<ResponseBase & { data: PatrolManagement }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management/${patrolManagementId}`;
    return this.httpClient.get<ResponseBase & { data: PatrolManagement }>(url);
  }

  override delete(
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management/${patrolManagementId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
