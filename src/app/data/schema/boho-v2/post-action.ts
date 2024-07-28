import { Nullable } from '@shared/shared.types';
import { AutoTrackOptions, ZoomAndCentralizeOptions } from './handover';

export interface PostAction {
  id: number;
  is_enabled: boolean;
  preset_id: number;
  auto_track?: Nullable<AutoTrackOptions>;
  zoom_and_centralize?: Nullable<ZoomAndCentralizeOptions>;
}

export function getPostActionType(postAction: PostAction) {
  if (postAction.auto_track) {
    return 'auto_track';
  }

  if (postAction.zoom_and_centralize) {
    return 'zoom_and_centralize';
  }

  return 'none';
}
