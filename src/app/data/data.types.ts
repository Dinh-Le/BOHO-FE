export type AlarmType =
  | 'loitering'
  | 'sabotage'
  | 'tripwire'
  | 'lost'
  | 'abandon';

export type ObjectType =
  | 'firetruck'
  | 'bike'
  | 'bus'
  | 'truck'
  | 'people'
  | 'ambulance'
  | 'car';

export type PostActionType = 'none' | 'auto_track' | 'zoom_and_centralize';
