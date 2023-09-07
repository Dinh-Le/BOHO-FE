import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class JWTTokenService {
  private _expiresIn = Number.MIN_SAFE_INTEGER;
  private _token = '';
  private _tokenKey = 'AUTH_TOKEN';

  constructor() {
    this.token = localStorage.getItem(this._tokenKey) || '';
  }

  get token(): string {
    return this._token;
  }

  set token(value: string) {
    if (this._token == value) {
      return;
    }

    this._token = value;
    const encodededPayload = this.token.split('.')[1];
    const payload = JSON.parse(atob(encodededPayload));
    this._expiresIn = payload.exp;

    localStorage.setItem(this._tokenKey, value);
  }

  get isExpired(): boolean {
    const current = moment().unix();
    return this._expiresIn <= current;
  }
}
