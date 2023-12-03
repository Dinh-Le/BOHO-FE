import { createReducer, on } from '@ngrx/store';
import { SidebarActions } from './sidebar.action';
import { SidebarState } from './sidebar.state';

export const initialState: SidebarState = {
  state: true,
  autoHideEnabled: false,
  devices: [],
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
  })),
  on(SidebarActions.addDevice, (_state, { device }) => ({
    ..._state,
    devices: [..._state.devices, device],
  })),
  on(SidebarActions.removeDevice, (_state, { device }) => ({
    ..._state,
    devices: _state.devices.filter((e) => e.id != device.id),
  })),
  on(SidebarActions.addDevices, (_state, { devices }) => ({
    ..._state,
    devices: [..._state.devices, ...devices],
  })),
  on(SidebarActions.removeDevices, (_state, { devices }) => {
    const deviceIds: Set<string> = new Set(devices.map((e) => e.id));
    return {
      ..._state,
      devices: _state.devices.filter((e) => !deviceIds.has(e.id)),
    };
  }),
  on(SidebarActions.updateSelectedMenuItem, (_state, { item }) => ({
    ..._state,
    selectedMenuItem: item,
  })),
  on(SidebarActions.setViewMode, (_state, { viewMode }) => ({
    ..._state,
    viewMode,
  }))
);
