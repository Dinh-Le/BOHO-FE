import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { lastValueFrom } from 'rxjs';

export interface AppConfiguration {
  production: boolean;
  baseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigurationService {
  constructor(private _http: HttpClient) {}

  public async load() {
    try {
      const data = await lastValueFrom(
        this._http.get<AppConfiguration>('/assets/app-configuration.json')
      );
      environment.baseUrl = data.baseUrl;
      environment.production = data.production;
    } catch (err) {
      console.error(err);
    }
  }
}
