import { PostActionTypeModel } from '../schema/boho-v2';

export * from './node-types.constant';
export * from './objects.constant';
export * from './camera-drivers.constant';
export * from './camera-types.constant';
export * from './locations.constanst';
export * from './device-types.constant';
export * from './device-status.constant';
export * from './datetime.constant';
export * from './rule-types.constant';
export * from './severities.constant';

export const InvalidId = '-1';

export const PostActionTypes: PostActionTypeModel[] = [
  {
    id: 'none',
    name: 'Không',
  },
  {
    id: 'zoom_and_centralize',
    name: 'Căn giữa & phóng to',
  },
  {
    id: 'auto_track',
    name: 'Tự động theo dõi',
  },
];
