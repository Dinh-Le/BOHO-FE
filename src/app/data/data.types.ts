export type AlarmType =
  | 'loitering event'
  | 'sabotage event'
  | 'tripwire event'
  | 'trespassing event'
  | 'lost event'
  | 'abandon event';

export type ObjectType =
  | 'firetruck'
  | 'bike'
  | 'bus'
  | 'truck'
  | 'people'
  | 'ambulance'
  | 'car';

export type PostActionType = 'none' | 'auto_track' | 'zoom_and_centralize';

export type TripwireDirectionType = 'left to right' | 'right to left' | 'both';

export type CameraType = 'Static' | 'PTZ';
