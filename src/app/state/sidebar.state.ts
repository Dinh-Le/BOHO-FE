import { ViewMode } from '@shared/components/tree-view/view-mode.enum';
import { Device } from '../data/schema/boho-v2/device';

export interface SidebarState {
  state: boolean;
  autoHideEnabled: boolean;
  devices: Device[];
  selectedMenuItem?: any;
  viewMode?: ViewMode;
}
