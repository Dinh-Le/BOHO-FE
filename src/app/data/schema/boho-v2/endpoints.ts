import { environment } from '@env';

export const BOHOEndpoints = {
  login: `${environment.baseUrl}/api/rest/v1/login`,
  changePassword: `${environment.baseUrl}/api/rest/v1/user/update_password`,
  nodes: `${environment.baseUrl}/api/rest/v1/nodes`,
  node: `${environment.baseUrl}/api/rest/v1/node/{0}`,
  createNode: `${environment.baseUrl}/api/rest/v1/node`,
  devices: `${environment.baseUrl}/api/rest/v1/node/{0}/devices`,
  device: `${environment.baseUrl}/api/rest/v1/node/{0}/device/{1}`,
  createDevice: `${environment.baseUrl}/api/rest/v1/node/{0}/device`,
  cameras: `${environment.baseUrl}/api/rest/v1/node/{0}/device/{1}/camera`,
  camera: `${environment.baseUrl}/api/rest/v1/node/{0}/device/{1}/camera`,
  createCamera: `${environment.baseUrl}/api/rest/v1/node/{0}/device/{1}/camera/{2}`,
};
