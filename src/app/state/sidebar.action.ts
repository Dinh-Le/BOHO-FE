import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Device } from '../data/schema/boho-v2/device';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';

export const SidebarActions = createActionGroup({
  source: 'Sidebar',
  events: {
    Hide: emptyProps(),
    Toggle: emptyProps(),
    'State Changed': props<{ value: boolean }>(),
    'Auto hide sidebar changed': props<{ value: boolean }>(),
    'Add device': props<{ device: Device }>(),
    'Remove device': props<{ device: Device }>(),
    'Add devices': props<{ devices: Device[] }>(),
    'Remove devices': props<{ devices: Device[] }>(),
    'Update selected menu item': props<{item: any}>(),
    'Set view mode': props<{ viewMode: ViewMode }>()
  },
});
