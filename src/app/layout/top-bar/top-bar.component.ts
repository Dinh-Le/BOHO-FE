import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { JWTTokenService } from '@app/services/jwt-token.service';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';

interface NavItem {
  isActive?: boolean;
  title: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
  navItems: NavItem[] = [
    {
      title: 'Tìm kiếm',
      path: '/search',
      icon: 'search',
    },
    {
      title: 'Cảnh báo',
      path: '/alert',
      icon: 'alert',
    },
    {
      title: 'Báo cáo',
      path: '/reports',
      icon: 'report',
    },
    {
      title: 'Quản trị',
      path: '/manage',
      icon: 'setting',
    },
  ];

  constructor(
    private router: Router,
    private store: Store<{ sidebar: SidebarState }>,
    private tokenService: JWTTokenService
  ) {
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const currentPath = (event as NavigationEnd).url;
        for (const item of this.navItems) {
          item.isActive = currentPath.startsWith(item.path);
        }
      });
  }

  toggleSidebar(event: Event) {
    this.store.dispatch(SidebarActions.toggle());
    event.stopPropagation();
  }

  logout() {
    this.tokenService.reset();
    this.router.navigateByUrl('/login');
  }
}
