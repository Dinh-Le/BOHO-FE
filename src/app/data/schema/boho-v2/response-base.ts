export interface ResponseBase {
  message: string;
  success: boolean;
}

export interface CreateResponse<T> extends ResponseBase {
  data: T;
}

export interface FindAllResponse<T> extends ResponseBase {
  data: T[];
}

export interface FindResponse<T> extends ResponseBase {
  data: T;
}
