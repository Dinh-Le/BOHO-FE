import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';

interface NavItem {
  active: boolean;
  title: string;
  path: string;
}

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
  navItems: NavItem[] = [
    {
      active: false,
      title: 'Tìm kiếm',
      path: '/search',
    },
    {
      active: false,
      title: 'Cảnh báo',
      path: '/alert',
    },
    {
      active: false,
      title: 'Báo cáo',
      path: '/reports',
    },
    {
      active: false,
      title: 'Quản trị',
      path: '/manage',
    },
  ];

  constructor(router: Router, private store: Store<{ sidebar: SidebarState }>) {
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const currentPath = (event as NavigationEnd).url;
        for (const item of this.navItems) {
          item.active = currentPath.startsWith(item.path);
        }
      });
  }

  toggleSidebar(event: Event) {
    this.store.dispatch(SidebarActions.toggle());
    event.stopPropagation();
  }
}
