import { Observable } from 'rxjs';
import { Milestone } from '../schema/boho-v2/milestone';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';
import { environment } from '@env';

export type CreateOrUpdateMilestoneRequest = Omit<Milestone, 'id'>;
export type CreateMilestoneResponse = ResponseBase & { data: number };

export abstract class MilestoneService extends RestfullApiService {
  public abstract create(
    data: CreateOrUpdateMilestoneRequest
  ): Observable<CreateMilestoneResponse>;
  public abstract findAll(): Observable<ResponseBase & { data: Milestone[] }>;
  public abstract find(
    id: number
  ): Observable<ResponseBase & { data: Milestone }>;
  public abstract update(
    id: number,
    data: CreateOrUpdateMilestoneRequest
  ): Observable<ResponseBase>;
  public abstract delete(id: number): Observable<ResponseBase>;
  public abstract connect(milestone: Milestone): Observable<ResponseBase>;
  public abstract verify(milestone: Milestone): Observable<ResponseBase>;
}

export class MilestoneServiceImpl extends MilestoneService {
  public override create(
    data: CreateOrUpdateMilestoneRequest
  ): Observable<CreateMilestoneResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone`;
    return this.httpClient.post<CreateMilestoneResponse>(url, data);
  }
  public override findAll(): Observable<ResponseBase & { data: Milestone[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone`;
    return this.httpClient.get<ResponseBase & { data: Milestone[] }>(url);
  }
  public override find(
    id: number
  ): Observable<ResponseBase & { data: Milestone }> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone/${id}`;
    return this.httpClient.get<ResponseBase & { data: Milestone }>(url);
  }
  public override update(
    id: number,
    data: CreateOrUpdateMilestoneRequest
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone/${id}`;
    return this.httpClient.patch<ResponseBase>(url, data);
  }
  public override delete(id: number): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone/${id}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
  public override connect(milestone: Milestone): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone/${milestone.id}/connect`;
    return this.httpClient.post<ResponseBase>(url, milestone.login_info);
  }
  public override verify(milestone: Milestone): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/milestone/${milestone.id}/verify`;
    const { host, port } = milestone.login_info;
    return this.httpClient.post<ResponseBase>(url, {
      host,
      port,
    });
  }
}
