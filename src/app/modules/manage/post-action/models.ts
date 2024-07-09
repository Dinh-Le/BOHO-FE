import { Rule } from 'src/app/data/schema/boho-v2/rule';
import {
  AutoTrackingOptions,
  PostActionType,
  ZoomAndFocusOptions,
} from '../camera-detail/models';

export class PostActionItemModel {
  selected: boolean = false;
  id?: number | null;
  rule?: Rule | null;
  postAction: PostActionType = 'focusAndZoom';
  postActionOptions?: ZoomAndFocusOptions | AutoTrackingOptions;
}
