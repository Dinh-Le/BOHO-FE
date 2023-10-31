import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { PatrolManagement } from '../schema/boho-v2/patrol-management';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class PatrolManagementService {
  abstract create(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    presetIds: string[]
  ): Observable<
    ResponseBase & {
      data: Pick<PatrolManagement, 'id'>;
    }
  >;
  abstract findAll(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<
    ResponseBase & {
      data: PatrolManagement[];
    }
  >;
  abstract find(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<
    ResponseBase & {
      data: PatrolManagement;
    }
  >;
  abstract delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class PatrolManagementServiceImpl extends PatrolManagementService {
  httpClient = inject(HttpClient);

  override create(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    presetIds: string[]
  ): Observable<ResponseBase & { data: Pick<PatrolManagement, 'id'> }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management`;
    return this.httpClient.post<
      ResponseBase & { data: Pick<PatrolManagement, 'id'> }
    >(url, { preset_ids: presetIds });
  }
  override findAll(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<ResponseBase & { data: PatrolManagement[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management`;
    return this.httpClient.get<ResponseBase & { data: PatrolManagement[] }>(
      url
    );
  }
  override find(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<ResponseBase & { data: PatrolManagement }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management/${patrolManagementId}`;
    return this.httpClient.get<ResponseBase & { data: PatrolManagement }>(url);
  }
  override delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string,
    patrolManagementId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}/patrol_management/${patrolManagementId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
