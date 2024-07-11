import {
  AutoTrackingOptions,
  PostActionType,
  ZoomAndFocusOptions,
} from '../camera-detail/models';
import { SelectItemModel } from '@shared/models/select-item-model';

export class PostActionItemModel {
  selected: boolean = false;
  id?: number;
  rules: SelectItemModel[] = [];
  postAction: PostActionType = 'focusAndZoom';
  postActionOptions?: ZoomAndFocusOptions | AutoTrackingOptions;
}
