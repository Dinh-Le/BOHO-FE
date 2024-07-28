import { Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { MenuItem } from '../menu-item';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { CameraType } from 'src/app/data/data.types';

@Component({
  selector: 'app-rule-menu',
  templateUrl: 'rule-menu.component.html',
})
export class RuleMenuComponent {
  @HostBinding('class') classNames =
    'd-flex align-items-center px-2 my-text-white';

  @Input('buttonsTemplate') buttonsTemplateRef?: TemplateRef<any>;

  readonly menuItemsSource: MenuItem[] = [
    {
      title: 'Quy tắc',
      icon: 'bi bi-list-check',
      path: 'rule',
    },
    {
      title: 'Lịch trình',
      icon: 'bi bi-clock',
      path: 'schedule',
    },
    {
      title: 'Hành động sau',
      icon: 'bi bi-cloud-fog2',
      path: 'post-action',
    },
  ];
  parentPath = '';

  constructor(
    navigationService: NavigationService,
    activatedRoute: ActivatedRoute
  ) {
    activatedRoute.params.subscribe(({ nodeId, cameraId: deviceId }) => {
      this.parentPath = `/manage/device-rule/node/${nodeId}/camera/${deviceId}/`;

      const cameraType: CameraType = navigationService.sideMenu.data?.camera
        ?.type as CameraType;

      // Update the path according to the camera type
      this.menuItemsSource[2].path =
        cameraType === 'PTZ' ? 'ptz-post-action' : 'post-action';

      // Check if camera type is changed, navigate to the correct url
      const expectedLevel3Menu =
        cameraType === 'PTZ'
          ? Level3Menu.PTZ_POST_ACTION
          : Level3Menu.POST_ACTION;
      if (navigationService.level3 !== expectedLevel3Menu) {
        navigationService.level3 = expectedLevel3Menu;
        navigationService.navigate();
        return;
      }

      const lastSegment =
        activatedRoute.snapshot.url[
          activatedRoute.snapshot.url.length - 1
        ].toString();
      for (const menuItem of this.menuItemsSource) {
        menuItem.selected = menuItem.path === lastSegment;
      }
    });
  }
}
