import { Observable } from 'rxjs';
import { BOHOObject } from '../schema/boho-v2/boho-object';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export abstract class ObjectService extends RestfullApiService {
  public abstract create(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    data: Omit<BOHOObject, 'id' | 'rule_id'>
  ): Observable<ResponseBase & { data: string }>;

  public abstract findAll(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string
  ): Observable<ResponseBase & { data: BOHOObject[] }>;

  public abstract find(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    objectId: string
  ): Observable<ResponseBase & { data: BOHOObject }>;

  public abstract update(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    data: Omit<BOHOObject, 'rule_id'>
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    objectId: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class ObjectServiceImpl extends ObjectService {
  public override create(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    data: Omit<BOHOObject, 'id' | 'rule_id'>
  ): Observable<ResponseBase & { data: string }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/camera/${cameraId}/rule/${ruleId}/object`;
    return this.httpClient.post<ResponseBase & { data: string }>(url, data);
  }

  public override findAll(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string
  ): Observable<ResponseBase & { data: BOHOObject[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/camera/${cameraId}/rule/${ruleId}/object`;
    return this.httpClient.get<ResponseBase & { data: BOHOObject[] }>(url);
  }

  public override find(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    objectId: string
  ): Observable<ResponseBase & { data: BOHOObject }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/camera/${cameraId}/rule/${ruleId}/object/${objectId}`;
    return this.httpClient.get<ResponseBase & { data: BOHOObject }>(url);
  }

  public override update(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    data: Omit<BOHOObject, 'rule_id'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/camera/${cameraId}/rule/${ruleId}/object/${data.object_id}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }

  public override delete(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string,
    objectId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/camera/${cameraId}/rule/${ruleId}/object/${objectId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
