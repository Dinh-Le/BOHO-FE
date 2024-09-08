import { map, Observable, of, switchMap } from 'rxjs';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { Rule } from '../schema/boho-v2/rule';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';

export abstract class RuleService {
  public abstract create(
    nodeId: string,
    deviceId: string | number,
    rule: Omit<Rule, 'id'>
  ): Observable<
    ResponseBase & {
      data: number;
    }
  >;

  public abstract findAll(
    nodeId: string,
    deviceId: string | number
  ): Observable<ResponseBase & { data: Rule[] }>;

  public abstract find(
    nodeId: string,
    deviceId: string | number,
    ruleId: string | number
  ): Observable<ResponseBase & { data: Rule }>;

  public abstract update(
    nodeId: string,
    deviceId: string | number,
    ruleId: number,
    rule: Omit<Rule, 'id'>
  ): Observable<ResponseBase>;

  public abstract delete(
    nodeId: string,
    deviceId: string | number,
    ruleId: string | number
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class RuleServiceImpl extends RuleService {
  httpClient = inject(HttpClient);

  public override create(
    nodeId: string,
    deviceId: string | number,
    rule: Omit<Rule, 'id'>
  ): Observable<
    ResponseBase & {
      data: number;
    }
  > {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/rule`;
    return this.httpClient.post<
      ResponseBase & {
        data: number;
      }
    >(url, rule);
  }

  public override findAll(
    nodeId: string,
    deviceId: string | number
  ): Observable<ResponseBase & { data: Rule[] }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/rule`;
    return this.httpClient.get<ResponseBase & { data: Rule[] }>(url).pipe(
      switchMap((response) => {
        if (!response.data) {
          response.data = [];
        }

        return of(response);
      })
    );
  }

  public override find(
    nodeId: string,
    deviceId: string | number,
    ruleId: string
  ): Observable<ResponseBase & { data: Rule }> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/rule/${ruleId}`;
    return this.httpClient.get<ResponseBase & { data: Rule }>(url);
  }

  public override update(
    nodeId: string,
    deviceId: string | number,
    ruleId: number,
    rule: Omit<Rule, 'id'>
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/rule/${ruleId}`;
    return this.httpClient.patch<ResponseBase>(url, rule);
  }

  public override delete(
    nodeId: string,
    deviceId: string | number,
    ruleId: string | number
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/node/${nodeId}/device/${deviceId}/rule/${ruleId}`;
    return this.httpClient.delete<ResponseBase>(url);
  }
}
