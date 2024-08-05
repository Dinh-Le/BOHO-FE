import { map, Observable } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { PostAction } from '../schema/boho-v2';
import { Injectable } from '@angular/core';
import { environment } from '@env';

export type FindAllPostActionResponse = ResponseBase & { data: PostAction[] };
export type CreatePostActionDto = Omit<PostAction, 'id'>;
export type CreatePostActionResponse = ResponseBase & { data: number[] };

export abstract class PostActionService extends RestfullApiService {
  public abstract findAll(
    nodeId: string,
    deviceId: number
  ): Observable<PostAction[]>;
  public abstract create(
    nodeId: string,
    deviceId: number,
    data: CreatePostActionDto[]
  ): Observable<number[]>;
  public abstract update(
    nodeId: string,
    deviceId: number,
    data: PostAction[]
  ): Observable<boolean>;
  public abstract delete(
    nodeId: string,
    deviceId: number,
    postActionId: number
  ): Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class PostActionServiceImpl extends PostActionService {
  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<PostAction[]> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action`;
    return this.httpClient
      .get<FindAllPostActionResponse>(url)
      .pipe(map((response) => response.data));
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: CreatePostActionDto[]
  ): Observable<number[]> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action`;
    return this.httpClient
      .post<CreatePostActionResponse>(url, {
        post_actions: data,
      })
      .pipe(map((response) => response.data));
  }
  public override update(
    nodeId: string,
    deviceId: number,
    data: PostAction[]
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action`;
    return this.httpClient
      .patch<ResponseBase>(url, {
        post_actions: data,
      })
      .pipe(map((response) => response.success));
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    postActionId: number
  ): Observable<boolean> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/post_action/${postActionId}`;
    return this.httpClient
      .delete<ResponseBase>(url)
      .pipe(map((response) => response.success));
  }
}
