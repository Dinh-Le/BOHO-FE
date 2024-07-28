import {
  AlarmType,
  CameraType,
  ObjectType,
  PostActionType,
} from '../../data.types';

export * from './device';
export * from './group-management';
export * from './group';
export * from './latlng';
export * from './node-operator';
export * from './node';
export * from './integration';
export * from './handover';
export * from './post-action';

export interface ObjectModel {
  id: ObjectType;
  name: string;
  icon: string;
  bounding_box_color: string;
}

export interface RuleTypeModel {
  id: AlarmType;
  name: string;
  cameraTypes: CameraType[];
}

export interface PostActionTypeModel {
  id: PostActionType;
  name: string;
}
