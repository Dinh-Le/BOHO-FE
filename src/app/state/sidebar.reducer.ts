import { createReducer, on } from '@ngrx/store';
import { SidebarActions } from './sidebar.action';
import { SidebarState } from './sidebar.state';

export const initialState: SidebarState = {
  state: true,
  autoHideEnabled: false,
};

export const sidebarReducer = createReducer(
  initialState,
  on(SidebarActions.hide, (_state) => ({ ..._state, state: false })),
  on(SidebarActions.toggle, (_state) => ({ ..._state, state: !_state.state })),
  on(SidebarActions.stateChanged, (_state, { value }) => ({
    ..._state,
    state: value,
  })),
  on(SidebarActions.autoHideSidebarChanged, (_state, { value }) => ({
    ..._state,
    autoHideEnabled: value,
  }))
);
