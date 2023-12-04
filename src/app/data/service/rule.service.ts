import { Observable } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Rule } from '../schema/boho-v2/rule';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class RuleService {
  public abstract create(
    userId: string,
    nodeId: string,
    deviceId: string,
    rule: Required<
      Omit<Rule, 'id'> & {
        preset_id: string;
        schedule_id: string;
      }
    >
  ): Observable<ResponseBase & { data: string }>;

  public abstract findAll(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Rule[] }>;

  public abstract find(
    userId: string,
    nodeId: string,
    deviceId: string,
    ruleId: string
  ): Observable<ResponseBase & { data: Rule }>;

  public abstract update(
    userId: string,
    nodeId: string,
    deviceId: string,
    rule: Required<
      Rule & {
        preset_id: string;
        schedule_id: string;
      }
    >
  ): Observable<ResponseBase>;

  public abstract delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    ruleId: string
  ): Observable<ResponseBase>;

  public abstract snapshot(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string
  ): Observable<string>;
}

@Injectable({ providedIn: 'root' })
export class RuleServiceImpl extends RuleService {
  httpClient = inject(HttpClient);

  public override create(
    userId: string,
    nodeId: string,
    deviceId: string,
    rule: Required<
      Omit<Rule, 'id'> & {
        preset_id: string;
        schedule_id: string;
      }
    >
  ): Observable<ResponseBase & { data: string }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}node/${nodeId}/device/${deviceId}/rule`;
    return this.httpClient.post<ResponseBase & { data: string }>(url, rule);
  }

  public override findAll(
    userId: string,
    nodeId: string,
    deviceId: string
  ): Observable<ResponseBase & { data: Rule[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}node/${nodeId}/device/${deviceId}/rule`;
    return this.httpClient.get<ResponseBase & { data: Rule[] }>(url);
  }

  public override find(
    userId: string,
    nodeId: string,
    deviceId: string,
    ruleId: string
  ): Observable<ResponseBase & { data: Rule }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}node/${nodeId}/device/${deviceId}/rule/${ruleId}`;
    return this.httpClient.get<ResponseBase & { data: Rule }>(url);
  }

  public override update(
    userId: string,
    nodeId: string,
    deviceId: string,
    rule: Required<
      Rule & {
        preset_id: string;
        schedule_id: string;
      }
    >
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}node/${nodeId}/device/${deviceId}/rule/${rule.id}`;
    return this.httpClient.patch<ResponseBase>(url, rule);
  }

  public override delete(
    userId: string,
    nodeId: string,
    deviceId: string,
    ruleId: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/${userId}node/${nodeId}/device/${deviceId}/rule/${ruleId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }

  public override snapshot(
    nodeId: string,
    deviceId: string,
    cameraId: string,
    ruleId: string
  ): Observable<string> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/camera/${cameraId}/rule/${ruleId}/snapshot`;
    return this.httpClient.get<string>(url);
  }
}
