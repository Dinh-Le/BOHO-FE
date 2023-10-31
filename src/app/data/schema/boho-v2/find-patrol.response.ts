import { Patrol } from './patrol';
import { ResponseBase } from './response-base';

export interface FindPatrolResponse extends ResponseBase {
  data: Patrol;
}
