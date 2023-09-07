import { ResponseBase } from './response-base';

export interface UserCredentials {
  name: string;
  password: string;
}

export interface UpdatePasswordRequest {
  user_id?: string;
  password: string;
}

export interface LoginResponse extends ResponseBase {
  data: string; // authorize token
}
