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

@Injectable({ providedIn: 'root' })
export class PostActionServiceMockImpl extends PostActionService {
  items: PostAction[] = [];

  public override findAll(
    nodeId: string,
    deviceId: number
  ): Observable<FindAllPostActionResponse> {
    return of({
      success: true,
      message: 'success',
      data: this.items.map((item) => Object.assign({}, item)),
    } as FindAllPostActionResponse);
  }
  public override create(
    nodeId: string,
    deviceId: number,
    data: CreatePostAction[]
  ): Observable<CreatePostActionResponse> {
    const ids = data.map((item) => {
      const id = this.items.length + 1;

      this.items.push({
        id,
        is_enabled: item.is_enabled,
        preset_id: item.preset_id,
        auto_track: item.auto_track,
        zoom_and_centralize: item.zoom_and_centralize,
      });

      return id;
    });
    console.log('Create', data);

    return of({
      success: true,
      message: 'success',
      data: ids,
    } as CreatePostActionResponse);
  }
  public override update(
    nodeId: string,
    deviceId: number,
    data: PostAction[]
  ): Observable<ResponseBase> {
    this.items = this.items.map((item) =>
      Object.assign(
        {},
        data.find((updateItem) => updateItem.id == item.id) ?? item
      )
    );
    console.log('Update', data);

    return of({
      success: true,
      message: 'success',
    } as ResponseBase);
  }
  public override delete(
    nodeId: string,
    deviceId: number,
    postActionId: number
  ): Observable<ResponseBase> {
    this.items = this.items.filter((item) => item.id !== postActionId);
    console.log('Delete', postActionId);

    return of({
      success: true,
      message: 'success',
    } as ResponseBase);
  }
}
