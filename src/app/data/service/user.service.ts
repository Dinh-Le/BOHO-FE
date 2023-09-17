import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JWTTokenService } from '../../core/services/jwt-token.service';
import { BOHOEndpoints } from '../constants/endpoints';
import {
  LoginResponse,
  UpdatePasswordRequest,
  UserCredentials,
} from '../schema/user';
import { ResponseBase } from '../schema/response-base';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private httpClient: HttpClient,
    private tokenService: JWTTokenService
  ) {}

  login(userCredentials: UserCredentials): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(BOHOEndpoints.login, userCredentials)
      .pipe(
        map((loginResponse: LoginResponse) => {
          if (loginResponse.success) {
            this.tokenService.token = loginResponse.data;
          }

          return loginResponse;
        })
      );
  }

  changePassword(
    updatePasswordRequest: UpdatePasswordRequest
  ): Observable<ResponseBase> {
    return this.httpClient.post<ResponseBase>(
      BOHOEndpoints.changePassword,
      updatePasswordRequest
    );
  }
}