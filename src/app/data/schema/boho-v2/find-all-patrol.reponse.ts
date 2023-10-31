import { Patrol } from './patrol';
import { ResponseBase } from './response-base';

export interface FindAllPatrolsReponse extends ResponseBase {
  data: Patrol[];
}
