import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Group } from '../schema/boho-v2/group';
import { RestfullApiService } from './restful-api.service';

export abstract class GroupService extends RestfullApiService {
  public abstract findAll(
    userId: string
  ): Observable<ResponseBase & { data: Group[] }>;
  public abstract find(
    userId: string,
    groupId: string
  ): Observable<ResponseBase & { data: Group }>;
  public abstract create(
    userId: string,
    data: Omit<Group, 'id'>
  ): Observable<ResponseBase>;
  public abstract update(
    userId: string,
    group: Group
  ): Observable<ResponseBase>;
  public abstract delete(
    userId: string,
    groupId: string
  ): Observable<ResponseBase>;
}

export class GroupServiceImpl extends GroupService {
  public findAll(userId: string): Observable<ResponseBase & { data: Group[] }> {
    const url = `/api/rest/v1/user/${userId}/group`;
    return this.httpClient.get<ResponseBase & { data: Group[] }>(url);
  }
  public find(
    userId: string,
    groupId: string
  ): Observable<ResponseBase & { data: Group }> {
    const url = `/api/rest/v1/user/${userId}/group/${groupId}`;
    return this.httpClient.get<ResponseBase & { data: Group }>(url);
  }
  public create(
    userId: string,
    data: Omit<Group, 'id'>
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/group`;
    return this.httpClient.post<ResponseBase>(url, data);
  }
  public update(userId: string, group: Group): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/group/${group.id}`;
    return this.httpClient.patch<ResponseBase>(url, group);
  }
  public delete(userId: string, groupId: string): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/group/${groupId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
