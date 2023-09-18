import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { SidebarState } from './sidebar.state';

@Injectable()
export class SidebarStore extends ComponentStore<SidebarState> {
  constructor() {
    super({ state: true, autoHideEnabled: false });
  }
}
