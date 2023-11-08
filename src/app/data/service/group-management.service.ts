import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { GroupManagement } from '../schema/boho-v2/group-management';
import { RestfullApiService } from './restful-api.service';
import { HttpParams } from '@angular/common/http';

export abstract class GroupManagementService extends RestfullApiService {
  public abstract create(
    userId: string,
    data: Omit<GroupManagement, 'id'>
  ): Observable<ResponseBase>;
  public abstract findAll(
    userId: string,
    groupId?: string
  ): Observable<ResponseBase & { data: GroupManagement[] }>;
  public abstract update(
    userId: string,
    groupManagement: GroupManagement
  ): Observable<ResponseBase>;
  public abstract delete(
    userId: string,
    groupManagementId: string
  ): Observable<ResponseBase>;
}

export class GroupManagementServiceImpl extends GroupManagementService {
  public create(
    userId: string,
    data: Omit<GroupManagement, 'id'>
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/group_management`;
    return this.httpClient.post<ResponseBase>(url, data);
  }
  public findAll(
    userId: string,
    groupId?: string
  ): Observable<ResponseBase & { data: GroupManagement[] }> {
    const url = `/api/rest/v1/user/${userId}/group_management`;
    if (groupId) {
      const params = new HttpParams();
      params.set('group_id', groupId);
      return this.httpClient.get<ResponseBase & { data: GroupManagement[] }>(
        url,
        { params }
      );
    } else {
      return this.httpClient.get<ResponseBase & { data: GroupManagement[] }>(
        url
      );
    }
  }
  public update(
    userId: string,
    groupManagement: GroupManagement
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/group_management/${groupManagement.id}`;
    return this.httpClient.patch<ResponseBase>(url, groupManagement);
  }
  public delete(
    userId: string,
    groupManagementId: string
  ): Observable<ResponseBase> {
    const url = `/api/rest/v1/user/${userId}/group_management/${groupManagementId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
