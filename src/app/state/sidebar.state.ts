import { Device } from '../data/schema/boho-v2/device';
import { MenuItem } from '../layout/menu/menu-item';

export interface SidebarState {
  state: boolean;
  autoHideEnabled: boolean;
  devices: Device[];
  selectedMenuItem: MenuItem | undefined;
}
