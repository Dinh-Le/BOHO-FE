import { Observable } from 'rxjs';
import { RestfullApiService } from './restful-api.service';
import { ResponseBase } from '../schema/boho-v2/response-base';
import { environment } from '@env';

export interface LicenseKeyItem {
  id: number;
  product_name: string;
  license_num: number;
  device_setup: number;
  device_remain: number;
}

export interface LicenseKeyInfo {
  license_key: string;
  data: LicenseKeyItem[];
}

export abstract class LicenseKeyService extends RestfullApiService {
  public abstract find(): Observable<ResponseBase & { data: LicenseKeyInfo }>;
  public abstract update(license_key: string): Observable<ResponseBase>;
}

export class LicenseKeyServiceImpl extends LicenseKeyService {
  public override find(): Observable<ResponseBase & { data: LicenseKeyInfo }> {
    const url = `${environment.baseUrl}/api/rest/v1/license_key`;
    return this.httpClient.get<ResponseBase & { data: LicenseKeyInfo }>(url);
  }
  public override update(license_key: string): Observable<ResponseBase> {
    const url = `${environment.baseUrl}/api/rest/v1/license_key`;
    return this.httpClient.patch<ResponseBase>(url, { license_key });
  }
}
