import { Component, HostBinding, Input, TemplateRef } from '@angular/core';
import { MenuItem } from '../menu-item';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { ActivatedRoute } from '@angular/router';

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

      const lastSegment =
        activatedRoute.snapshot.url[
          activatedRoute.snapshot.url.length - 1
        ].toString();
      for (const menuItem of this.menuItemsSource) {
        menuItem.selected = menuItem.path === lastSegment;
      }

      if (navigationService.sideMenu.data?.camera?.type !== 'Static') {
        this.menuItemsSource[2].class = 'd-none';
        navigationService.level3 = Level3Menu.RULE;
        navigationService.navigate();
      } else {
        this.menuItemsSource[2].class = '';
      }
    });
  }
}
