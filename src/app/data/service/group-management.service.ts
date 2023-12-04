import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { GroupManagement } from '../schema/boho-v2/group-management';
import { RestfullApiService } from './restful-api.service';
import { HttpParams } from '@angular/common/http';
import { environment } from '@env';

export type CreateGroupManageResponse = ResponseBase & { data: string };

export abstract class GroupManagementService extends RestfullApiService {
  public abstract create(
    data: Omit<GroupManagement, 'id'>
  ): Observable<CreateGroupManageResponse>;

  public abstract findAll(
    groupId?: string
  ): Observable<ResponseBase & { data: GroupManagement[] }>;

  public abstract update(
    groupManagement: GroupManagement
  ): Observable<ResponseBase>;

  public abstract delete(groupManagementId: string): Observable<ResponseBase>;
}

export class GroupManagementServiceImpl extends GroupManagementService {
  public create(
    data: Omit<GroupManagement, 'id'>
  ): Observable<CreateGroupManageResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/group_management`;
    return this.httpClient.post<CreateGroupManageResponse>(url, data);
  }

  public findAll(
    groupId?: string
  ): Observable<ResponseBase & { data: GroupManagement[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/group_management`;

    if (groupId) {
      const params = new HttpParams().set('group_id', groupId);
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

  public update(groupManagement: GroupManagement): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/group_management/${groupManagement.id}`;
    return this.httpClient.patch<ResponseBase>(url, groupManagement);
  }

  public delete(groupManagementId: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/group_management/${groupManagementId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
