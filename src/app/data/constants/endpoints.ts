import { environment } from '@env';

export const BOHOEndpoints = {
  login: `${environment.baseUrl}/api/rest/v1/login`,
  changePassword: `${environment.baseUrl}/api/rest/v1/user/update_password`,
  node: `${environment.baseUrl}/api/rest/v1/nodes`,
};
