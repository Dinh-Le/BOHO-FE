import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ViewMode } from '@shared/components/tree-view/view-mode.enum';
import {
  Level2Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  router = inject(Router);
  store = inject(Store<{ sidebar: SidebarState }>);
  activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);

  menuLevel2: {
    [key in Level2Menu]: {
      icon: string;
      text: string;
      path?: string;
      isActive?: boolean;
    };
  } = {
    [Level2Menu.DASHBOARD]: {
      icon: 'dashboard',
      text: 'Bảng thông tin',
    },
    [Level2Menu.SYSTEM]: {
      icon: 'system',
      text: 'Hệ thống',
      path: '/manage/system',
    },
    [Level2Menu.NODE]: {
      icon: 'node',
      text: 'Node',
      path: '/manage/group-node',
    },
    [Level2Menu.CAMERA]: {
      icon: 'video-camera-1',
      text: 'Camera',
      path: '/manage/group-camera',
    },
    [Level2Menu.RULE]: {
      icon: 'rule',
      text: 'Quy tắc',
      path: '/manage/device-rule',
    },
    [Level2Menu.VEHICLE]: {
      icon: 'licence-plate',
      text: 'Biển số xe',
      path: '/manage/vehicle-list',
    },
    [Level2Menu.INTEGRATION]: {
      icon: 'integration',
      text: 'Tích hợp',
      path: '/manage/integration',
    },
  };

  ngOnInit(): void {
    if (this._navigationService.level2 in this.menuLevel2) {
      this.menuLevel2[this._navigationService.level2].isActive = true;
    }
  }

  onMenuItemClick(menuId: Level2Menu): void {
    if (menuId === this._navigationService.level2) {
      return;
    }

    Object.values(this.menuLevel2).forEach((e) => (e.isActive = false));
    this.menuLevel2[menuId].isActive = true;
    this._navigationService.level2 = menuId;
    this._navigationService.navigate();

    if (menuId === Level2Menu.NODE) {
      this.store.dispatch(
        SidebarActions.setViewMode({ viewMode: ViewMode.Logical })
      );
    } else if (menuId === Level2Menu.CAMERA) {
      this.store.dispatch(
        SidebarActions.setViewMode({ viewMode: ViewMode.Geolocation })
      );
    }
  }
}
