import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const SidebarActions = createActionGroup({
  source: 'Sidebar',
  events: {
    Hide: emptyProps(),
    Toggle: emptyProps(),
    'State Changed': props<{ value: boolean }>(),
    'Auto hide sidebar changed': props<{ value: boolean }>(),
  },
});
