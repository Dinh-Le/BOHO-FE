import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { catchError, lastValueFrom, of } from 'rxjs';

export interface AppConfiguration {
  production: boolean;
  baseUrl: string;
  tileServerBaseUrl: string;
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

      const tilejson = await lastValueFrom(
        this._http
          .get<any>(`${data.tileServerBaseUrl}/styles/512/basic-preview.json`)
          .pipe(catchError(() => of(null)))
      );
      if (tilejson) {
        environment.tilejson = tilejson;
      }
    } catch (err) {
      console.error(err);
    }
  }
}
