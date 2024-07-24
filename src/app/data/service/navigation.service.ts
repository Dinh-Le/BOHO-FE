import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';

export enum Level1Menu {
  SEARCH = 'SEARCH',
  ALERT = 'ALERT',
  REPORT = 'REPORT',
  MANAGE = 'MANAGE',
}

export enum Level2Menu {
  DASHBOARD = 'DASHBOARD',
  SYSTEM = 'SYSTEM',
  NODE = 'NODE',
  CAMERA = 'CAMERA',
  RULE = 'RULE',
  VEHICLE = 'VEHICLE',
  INTEGRATION = 'INTEGRATION',
}

export enum Level3Menu {
  NONE = 'NONE',
  DEVICE_INFO = 'DEVICE_INFO',
  GENERAL_SETTINGS = 'GENERAL_SETTINGS',
  PRESET_SETTINGS = 'PRESET_SETTINGS',
  PATROL_SETTINGS = 'PATROL_SETTINGS',
  TOUR_SETTINGS = 'TOUR_SETTINGS',
  RULE = 'RULE',
  SCHEDULE = 'SCHEDULE',
  MILESTONE_VMS = 'MILESTONE_VMS',
  LICENSE_MANAGER = 'LICENSE_MANAGER',
  CHUYEN_PTZ = 'CHUYEN_PTZ',
  POST_ACTION = 'POST_ACTION',
}

export enum SideMenuItemType {
  USER = 'USER',
  NODE_OPERATOR = 'NODE_OPERATOR',
  NODE = 'NODE',
  GROUP = 'GROUP',
  DEVICE = 'DEVICE',
}

export type SideMenuConfig = {
  id?: string;
  type?: SideMenuItemType;
  data?: any;
};

@Injectable({ providedIn: 'root' })
export class NavigationService {
  selectedDeviceIds: {
    [key: string]: {
      [key: string]: any;
    };
  } = {};
  selectedDevices$ = new BehaviorSubject<any[]>([]);
  treeItemChange$ = new Subject<{
    type: SideMenuItemType;
    action: 'create' | 'update' | 'delete';
    data: any;
  }>();
  viewModeChange$ = new Subject<ViewMode>();

  private _level1: Level1Menu = Level1Menu.MANAGE;
  private _level2: Level2Menu = Level2Menu.NODE;
  private _level3: Level3Menu = Level3Menu.NONE;
  private _viewMode: ViewMode = ViewMode.None;
  private _autoHide: boolean = false;
  private _sideMenu: SideMenuConfig = {};

  //#region getter/setter
  get level1(): Level1Menu {
    return this._level1;
  }

  set level1(value: Level1Menu) {
    this._level1 = value;
    localStorage.setItem('menu_level_1', value);
  }

  get level2(): Level2Menu {
    return this._level2;
  }

  set level2(value: Level2Menu) {
    this._level2 = value;
    localStorage.setItem('menu_level_2', value);
  }

  get level3(): Level3Menu {
    return this._level3;
  }

  set level3(value: Level3Menu) {
    this._level3 = value;
    localStorage.setItem('menu_level_3', value);
  }

  get viewMode(): ViewMode {
    return this._viewMode;
  }

  set viewMode(value: ViewMode) {
    if (value === this._viewMode) {
      return;
    }

    this._viewMode = value;
    localStorage.setItem('menu_view_mode', value);
    this.viewModeChange$.next(value);
  }

  get autoHide(): boolean {
    return this._autoHide;
  }

  set autoHide(value: boolean) {
    this._autoHide = value;
    localStorage.setItem('menu_auto_hide', String(value));
  }

  get sideMenu(): SideMenuConfig {
    return this._sideMenu;
  }

  set sideMenu(value: SideMenuConfig) {
    this._sideMenu = value;
    localStorage.setItem('side_menu_selected_item', JSON.stringify(value));
  }
  //#endregion

  constructor(private router: Router) {
    this._level1 =
      Level1Menu[
        (localStorage.getItem('menu_level_1') as keyof typeof Level1Menu) ??
          'MANAGE'
      ];
    this._level2 =
      Level2Menu[
        (localStorage.getItem('menu_level_2') as keyof typeof Level2Menu) ??
          'DASHBOARD'
      ];
    this._level3 =
      Level3Menu[
        (localStorage.getItem('menu_level_3') as keyof typeof Level3Menu) ??
          'NONE'
      ];
    this._viewMode =
      ViewMode[
        (localStorage.getItem('menu_view_mode') as keyof typeof ViewMode) ??
          'Logical'
      ];
    this._autoHide = Boolean(localStorage.getItem('menu_auto_hide') ?? 'true');
    this._sideMenu = JSON.parse(
      localStorage.getItem('side_menu_selected_item') ?? '{}'
    );
  }

  navigate() {
    let targetUrl = '';

    switch (this.level1) {
      case Level1Menu.SEARCH:
        targetUrl = '/search';
        break;
      case Level1Menu.ALERT:
        targetUrl = '/alert';
        this.sideMenu.type = SideMenuItemType.USER;
        break;
      case Level1Menu.REPORT:
        targetUrl = '/report';
        break;
      case Level1Menu.MANAGE:
        targetUrl = this.navigateToManage();
        break;
    }

    // console.log('Target url: ', targetUrl);
    this.router.navigateByUrl(targetUrl);
  }

  private navigateToManage(): string {
    let targetUrl = '/manage';

    // console.log(this.level1, this.level2, this.level3, this.sideMenu);

    switch (this.level2) {
      case Level2Menu.DASHBOARD:
        if (this.sideMenu?.type === SideMenuItemType.NODE) {
          targetUrl += `/dashboard/node/${this.sideMenu.id}`;
        } else if (this.sideMenu?.type === SideMenuItemType.NODE_OPERATOR) {
          targetUrl += `/dashboard/group-node/${this.sideMenu.id}`;
        } else if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          targetUrl += `/dashboard/node/${this.sideMenu.data?.node_id}/camera/${this.sideMenu.id}`;
        } else {
          targetUrl += `/dashboard`;
        }
        break;
      case Level2Menu.SYSTEM:
        targetUrl += '/system';
        if (this.level3 === Level3Menu.MILESTONE_VMS) {
          targetUrl += '/milestone-vms';
        } else {
          targetUrl += '/license-manager';
        }
        break;
      case Level2Menu.NODE:
        if (this.sideMenu?.type === SideMenuItemType.USER) {
          targetUrl += '/group-node';
        } else if (this.sideMenu?.type === SideMenuItemType.NODE_OPERATOR) {
          targetUrl += `/group-node/${this.sideMenu.id}/node`;
        } else if (this.sideMenu?.type === SideMenuItemType.NODE) {
          targetUrl += `/node/${this.sideMenu.id}/camera`;
        } else if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          const nodeId = this.sideMenu.data?.node_id;
          if (this.level3 === Level3Menu.GENERAL_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/settings`;
          } else if (this.level3 === Level3Menu.PRESET_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/preset-settings`;
          } else if (this.level3 === Level3Menu.PATROL_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/patrol-settings`;
          } else if (this.level3 === Level3Menu.TOUR_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/tour-settings`;
          } else if (this.level3 === Level3Menu.CHUYEN_PTZ) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/chuyen-ptz`;
          } else {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/info`;
          }
        }
        break;
      case Level2Menu.CAMERA:
        if (
          this.sideMenu?.type === SideMenuItemType.USER &&
          this.viewMode == ViewMode.Geolocation
        ) {
          targetUrl += '/group-camera/0';
        } else if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          const nodeId = this.sideMenu.data?.node_id;
          if (this.level3 === Level3Menu.GENERAL_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/settings`;
          } else if (this.level3 === Level3Menu.PRESET_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/preset-settings`;
          } else if (this.level3 === Level3Menu.PATROL_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/patrol-settings`;
          } else if (this.level3 === Level3Menu.TOUR_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/tour-settings`;
          } else if (this.level3 === Level3Menu.CHUYEN_PTZ) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/chuyen-ptz`;
          } else {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/info`;
          }
        } else {
          targetUrl += '/group-camera';
        }
        break;
      case Level2Menu.RULE:
        targetUrl += '/device-rule';
        const nodeId = this.sideMenu.data?.node_id;
        if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          if (this.level3 === Level3Menu.POST_ACTION) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/post-action`;
          } else if (this.level3 === Level3Menu.SCHEDULE) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/schedule`;
          } else {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/rule`;
          }
        }
        break;
      case Level2Menu.VEHICLE:
        targetUrl += '/vehicle-list';
        break;
      case Level2Menu.INTEGRATION:
        targetUrl += '/integration';
        if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          const nodeId = this.sideMenu.data?.node_id;
          targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}`;
        }
        break;
    }

    return targetUrl;
  }
}
