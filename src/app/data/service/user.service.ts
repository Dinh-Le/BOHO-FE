import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { JWTTokenService } from '../../core/services/jwt-token.service';
import { User } from '../schema/boho-v2/user';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { RestfullApiService } from './restful-api.service';
import { environment } from '@env';

export abstract class UserService extends RestfullApiService {
  public currentUser: User | undefined;

  public abstract create(user: Omit<User, 'id'>): Observable<ResponseBase>;

  public abstract findAll(): Observable<ResponseBase & { data: User }>;

  public abstract login(
    user: Required<Pick<User, 'name' | 'password'>>
  ): Observable<ResponseBase & { data: string }>;

  public abstract updatePassword(
    userId: string,
    password: string
  ): Observable<ResponseBase>;

  public abstract updateRole(
    userId: string,
    role: string
  ): Observable<ResponseBase>;
}

@Injectable({ providedIn: 'root' })
export class UserServiceImpl extends UserService {
  tokenService = inject(JWTTokenService);

  public override create(user: Omit<User, 'id'>): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/user/add_user`;
    return this.httpClient.post<ResponseBase>(url, user);
  }

  public override findAll(): Observable<ResponseBase & { data: User }> {
    const url = `${environment.baseUrl}/api/rest/v1/user/get_users`;
    return this.httpClient.get<ResponseBase & { data: User }>(url);
  }

  public override login(
    user: Required<Pick<User, 'name' | 'password'>>
  ): Observable<ResponseBase & { data: string }> {
    const url = `${environment.baseUrl}/api/rest/v1/login`;
    return this.httpClient
      .post<ResponseBase & { data: string }>(url, user)
      .pipe(
        map((loginResponse: ResponseBase & { data: string }) => {
          if (loginResponse.success) {
            this.tokenService.token = loginResponse.data;
          }

          return loginResponse;
        })
      );
  }

  public override updatePassword(
    userId: string,
    password: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/user/update_password`;
    return this.httpClient.post<ResponseBase>(url, {
      user_id: userId,
      password,
    });
  }

  public override updateRole(
    userId: string,
    role: string
  ): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/user/update_role`;
    return this.httpClient.post<ResponseBase>(url, { user_id: userId, role });
  }
}
