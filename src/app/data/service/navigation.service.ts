import { NavigationEnd, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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
  PRESET_SETTINGS = 'PRESET_SETTINGS',
  PATROL_SETTINGS = 'PATROL_SETTINGS',
  TOUR_SETTINGS = 'TOUR_SETTINGS',
  RULE = 'RULE',
  SCHEDULE = 'SCHEDULE',
}

export enum SideMenuItemType {
  USER = 'USER',
  NODE_OPERATOR = 'NODE_OPERATOR',
  NODE = 'NODE',
  GROUP = 'GROUP',
  DEVICE = 'DEVICE',
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  level1: Level1Menu = Level1Menu.MANAGE;
  level2: Level2Menu = Level2Menu.DASHBOARD;
  level3: Level3Menu = Level3Menu.NONE;
  sideMenu: {
    id?: string;
    type?: SideMenuItemType;
    data?: any;
  } = {};
  selectedDeviceIds: {
    [key: string]: {
      [key: string]: any;
    };
  } = {};
  selectedDeviceChange$ = new Subject();
  treeItemChange$ = new Subject<{
    type: SideMenuItemType;
    action: 'create' | 'update' | 'delete';
    data: any;
  }>();

  constructor(private router: Router) {
    this.onUrlChange();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.onUrlChange();
      }
    });
  }

  private onUrlChange() {
    const url = this.router.url;
    const segments = url.split('/');

    switch (segments[1]) {
      case 'search':
        this.level1 = Level1Menu.SEARCH;
        this.selectedDeviceIds = {};
        break;
      case 'alert':
        this.level1 = Level1Menu.ALERT;
        break;
      case 'report':
        this.level1 = Level1Menu.REPORT;
        break;
      case 'manage':
        this.level1 = Level1Menu.MANAGE;
        break;
    }

    if (this.level1 === Level1Menu.MANAGE && segments.length > 2) {
      switch (segments[2]) {
        case 'system':
          this.level2 = Level2Menu.SYSTEM;
          break;
        case 'group-node':
          this.level2 = Level2Menu.NODE;
          this.sideMenu.type = SideMenuItemType.NODE_OPERATOR;
          this.sideMenu.id = segments[3];
          break;
        case 'node':
          this.level2 = Level2Menu.NODE;

          if (segments.length > 5) {
            if (segments[6] === 'info') {
              this.level3 = Level3Menu.DEVICE_INFO;
            } else if (segments[6] === 'preset-settings') {
              this.level3 = Level3Menu.PRESET_SETTINGS;
            } else if (segments[6] === 'patrol-settings') {
              this.level3 = Level3Menu.PATROL_SETTINGS;
            } else if (segments[6] === 'tour-settings') {
              this.level3 = Level3Menu.TOUR_SETTINGS;
            } else {
              this.level3 = Level3Menu.NONE;
            }

            this.sideMenu.id = segments[5];
            this.sideMenu.type = SideMenuItemType.DEVICE;
            this.sideMenu.data = {
              id: segments[5],
              node_id: segments[3],
            };
          } else {
            this.sideMenu.type = SideMenuItemType.NODE;
            this.sideMenu.id = segments[3];
          }
          break;
        case 'group-camera':
          this.level2 = Level2Menu.CAMERA;
          break;
        case 'device-rule':
          this.level2 = Level2Menu.RULE;

          if (segments.length === 6) {
            this.sideMenu.id = segments[6];
            this.sideMenu.type = SideMenuItemType.DEVICE;
            this.sideMenu.data = {
              id: segments[6],
              node_id: segments[4],
            };
            if (segments[8] === 'rule') {
              this.level3 = Level3Menu.RULE;
            } else if (segments[8] === 'schedule') {
              this.level3 = Level3Menu.SCHEDULE;
            }
          }
          break;
        case 'integration':
          this.level2 = Level2Menu.INTEGRATION;
          if (segments.length === 7) {
            this.sideMenu.id = segments[6];
            this.sideMenu.type = SideMenuItemType.DEVICE;
            this.sideMenu.data = {
              id: segments[6],
              node_id: segments[4],
            };
          }
          break;
      }
    }
  }

  navigate() {
    let targetUrl = '';

    switch (this.level1) {
      case Level1Menu.SEARCH:
        targetUrl = '/search';
        break;
      case Level1Menu.ALERT:
        targetUrl = '/alert';
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
        break;
      case Level2Menu.SYSTEM:
        targetUrl += '/system';
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
          if (this.level3 === Level3Menu.PRESET_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/preset-settings`;
          } else if (this.level3 === Level3Menu.PATROL_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/patrol-settings`;
          } else if (this.level3 === Level3Menu.TOUR_SETTINGS) {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/tour-settings`;
          } else {
            targetUrl += `/node/${nodeId}/camera/${this.sideMenu.id}/info`;
          }
        }
        break;
      case Level2Menu.CAMERA:
        if (this.sideMenu?.type === SideMenuItemType.GROUP) {
          targetUrl += '/group-camera';
        } else if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          targetUrl += `/camera/${this.sideMenu.id}/info`;
        }
        break;
      case Level2Menu.RULE:
        targetUrl += '/device-rule';
        const nodeId = this.sideMenu.data?.node_id;
        if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          if (this.level3 === Level3Menu.SCHEDULE) {
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
