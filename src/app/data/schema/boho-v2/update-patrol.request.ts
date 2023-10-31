import { Patrol } from './patrol';

export type UpdatePatrolRequest = Omit<Patrol, 'id'>;
