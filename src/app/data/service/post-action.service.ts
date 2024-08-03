import { Observable, of } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { PostAction } from '../schema/boho-v2';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export type FindAllPostActionResponse = ResponseBase & { data: PostAction[] };
export type CreatePostAction = Omit<PostAction, 'id'>;
export type CreatePostActionResponse = ResponseBase & { data: number[] };

export abstract class PostActionService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: number
  ): Observable<FindAllPostActionResponse>;
  public abstract create(
    nodeId: string,
    deviceId: number,
    data: CreatePostAction[]
  ): Observable<CreatePostActionResponse>;
  public abstract update(
    nodeId: string,
    deviceId: number,
    data: PostAction[]
  ): Observable<ResponseBase>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    postActionId: number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class PostActionServiceImpl extends PostActionService {
  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<FindAllPostActionResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action`;
    return this.httpClient.get<FindAllPostActionResponse>(url);
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: CreatePostAction[]
  ): Observable<CreatePostActionResponse> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action`;
    return this.httpClient.post<CreatePostActionResponse>(url, {
      post_actions: data,
    });
  }
  public override update(
    nodeId: string,
    deviceId: number,
    data: PostAction[]
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action`;
    return this.httpClient.patch<ResponseBase>(url, {
      post_actions: data,
    });
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    postActionId: number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action/${postActionId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
