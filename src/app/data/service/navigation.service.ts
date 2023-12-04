import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Injectable } from '@angular/core';

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
      case '/search':
        this.level1 = Level1Menu.SEARCH;
        break;
      case '/alert':
        this.level1 = Level1Menu.ALERT;
        break;
      case '/report':
        this.level1 = Level1Menu.REPORT;
        break;
      case '/manage':
        this.level1 = Level1Menu.MANAGE;
        break;
    }

    if (this.level1 === Level1Menu.MANAGE && segments.length > 1) {
      switch (segments[2]) {
        case 'system':
          this.level2 = Level2Menu.SYSTEM;
          break;
        case 'node':
        case 'group-node':
          if (segments.length > 2) {
            this.sideMenu.id = segments[3];
          }
          this.level2 = Level2Menu.NODE;
          break;
        case 'camera':
          if (segments.length > 2) {
            this.sideMenu.id = segments[3];
          }
          this.level2 = Level2Menu.NODE;
          if (segments.length > 5) {
            if (segments[4] === 'info') {
              this.level3 = Level3Menu.DEVICE_INFO;
            } else if (segments[4] === 'preset-settings') {
              this.level3 = Level3Menu.PRESET_SETTINGS;
            } else if (segments[4] === 'patrol-settings') {
              this.level3 = Level3Menu.PATROL_SETTINGS;
            } else if (segments[4] === 'tour-settings') {
              this.level3 = Level3Menu.TOUR_SETTINGS;
            } else {
              this.level3 = Level3Menu.NONE;
            }
          }
          break;
        case 'group-camera':
          this.level2 = Level2Menu.CAMERA;
          break;
        case 'device-rule':
          if (segments.length > 2) {
            this.sideMenu.id = segments[3];
          }
          this.level2 = Level2Menu.RULE;
          if (segments.length > 5) {
            if (segments[4] === 'rule') {
              this.level3 = Level3Menu.RULE;
            } else if (segments[4] === 'schedule') {
              this.level3 = Level3Menu.SCHEDULE;
            }
          }
          break;
        case 'integrate':
          this.level2 = Level2Menu.INTEGRATION;
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
        if (this.sideMenu?.type === SideMenuItemType.DEVICE) {
          if (this.level3 === Level3Menu.SCHEDULE) {
            targetUrl += `/${this.sideMenu.id}/schedule`;
          } else {
            targetUrl += `/${this.sideMenu.id}/rule`;
          }
        }
        break;
      case Level2Menu.VEHICLE:
        targetUrl += '/vehicle-list';
        break;
      case Level2Menu.INTEGRATION:
        targetUrl += '/integration';
        break;
    }

    return targetUrl;
  }
}
