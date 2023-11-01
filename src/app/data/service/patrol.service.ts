import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Patrol } from '../schema/boho-v2/patrol';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class PatrolService {
  abstract create(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrol: Omit<Patrol, 'id'>
  ): Observable<
    ResponseBase & {
      data: string;
    }
  >;
  abstract findAll(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<
    ResponseBase & {
      data: Patrol[];
    }
  >;
  abstract find(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<
    ResponseBase & {
      data: Patrol;
    }
  >;
  abstract update(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrol: Patrol
  ): Observable<ResponseBase>;
  abstract delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class PatrolServiceImpl extends PatrolService {
  httpClient = inject(HttpClient);

  override create(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrol: Omit<Patrol, 'id'>
  ): Observable<
    ResponseBase & {
      data: string;
    }
  > {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol`;
    return this.httpClient.post<
      ResponseBase & {
        data: string;
      }
    >(url, {
      name: patrol.name,
    });
  }

  override findAll(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<
    ResponseBase & {
      data: Patrol[];
    }
  > {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol`;
    return this.httpClient.get<
      ResponseBase & {
        data: Patrol[];
      }
    >(url);
  }

  override find(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<
    ResponseBase & {
      data: Patrol;
    }
  > {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}`;
    return this.httpClient.get<
      ResponseBase & {
        data: Patrol;
      }
    >(url);
  }

  override update(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrol: Patrol
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrol.id}`;
    return this.httpClient.patch<ResponseBase>(url, { name: patrol.name });
  }

  override delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    patrolId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}/node/${nodeId}/device/${deviceId}/patrol/${patrolId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
