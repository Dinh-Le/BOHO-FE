import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Group } from '../schema/boho-v2/group';
import { RestfullApiService } from './restful-api.service';
import { environment } from '@env';

export type CreateOrUpdateGroupRequestDto = Omit<Group, 'id'>;
export type CreateGroupResponseDto = ResponseBase & { data: string };

export abstract class GroupService extends RestfullApiService {
  public abstract findAll(): Observable<ResponseBase & { data: Group[] }>;

  public abstract find(id: string): Observable<ResponseBase & { data: Group }>;

  public abstract create(
    data: CreateOrUpdateGroupRequestDto
  ): Observable<CreateGroupResponseDto>;

  public abstract update(
    id: string,
    data: CreateOrUpdateGroupRequestDto
  ): Observable<ResponseBase>;

  public abstract delete(id: string): Observable<ResponseBase>;
}

export class GroupServiceImpl extends GroupService {
  public findAll(): Observable<ResponseBase & { data: Group[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/group`;
    return this.httpClient.get<ResponseBase & { data: Group[] }>(url);
  }

  public find(groupId: string): Observable<ResponseBase & { data: Group }> {
    const url = `${environment.baseUrl}/api/rest/v1/group/${groupId}`;
    return this.httpClient.get<ResponseBase & { data: Group }>(url);
  }

  public create({
    name,
    describle,
  }: CreateOrUpdateGroupRequestDto): Observable<CreateGroupResponseDto> {
    const url = `${environment.baseUrl}/api/rest/v1/group`;
    return this.httpClient.post<CreateGroupResponseDto>(url, {
      name,
      describle,
    });
  }

  public update(
    id: string,
    { name, describle }: CreateOrUpdateGroupRequestDto
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/group/${id}`;
    return this.httpClient.patch<ResponseBase>(url, { name, describle });
  }

  public delete(groupId: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/group/${groupId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
