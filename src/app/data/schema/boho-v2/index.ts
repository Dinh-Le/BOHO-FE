export * from './device';
export * from './group-management';
export * from './group';
export * from './latlng';
export * from './node-operator';
export * from './node';
export * from './integration';

export interface ObjectModel {
  id: string;
  name: string;
  icon: string;
  bounding_box_color: string;
}

export interface RuleTypeModel {
  id: string;
  name: string;
  cameraTypes: ('Static' | 'PTZ')[];
}
