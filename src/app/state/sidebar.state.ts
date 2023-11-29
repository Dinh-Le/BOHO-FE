import { Device } from '../data/schema/boho-v2/device';

export interface SidebarState {
  state: boolean;
  autoHideEnabled: boolean;
  devices: Device[];
}
