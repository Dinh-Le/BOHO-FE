import { map, Observable } from 'rxjs';
import { HandoverLinking } from '../schema/boho-v2';
import { RestfullApiService } from './restful-api.service';
import { environment } from '@env';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { HttpParams } from '@angular/common/http';

export abstract class HandoverLinkingService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: number
  ): Observable<HandoverLinking[]>;
  public abstract create(
    nodeId: string,
    deviceId: number,
    data: HandoverLinking[]
  ): Observable<boolean>;
  public abstract update(
    nodeId: string,
    deviceId: number,
    data: HandoverLinking[]
  ): Observable<boolean>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    handoverIds: number[]
  ): Observable<boolean>;
}

export class HandoverLinkingServiceImpl extends HandoverLinkingService {
  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<HandoverLinking[]> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover_linking`;
    return this.httpClient
      .get<ResponseBase & { data: HandoverLinking[] }>(url)
      .pipe(map((response) => response.data));
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: HandoverLinking[]
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover_linking`;
    return this.httpClient
      .post<ResponseBase>(url, {
        linking_data: data,
      })
      .pipe(map((response) => response.success));
  }
  public override update(
    nodeId: string,
    deviceId: number,
    data: HandoverLinking[]
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover_linking`;
    return this.httpClient
      .patch<ResponseBase>(url, {
        linking_data: data,
      })
      .pipe(map((response) => response.success));
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    handoverIds: number[]
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/handover_linking`;
    return this.httpClient
      .delete<ResponseBase>(url, {
        params: new HttpParams().append('h', handoverIds.join(',')),
      })
      .pipe(map((response) => response.success));
  }
}
