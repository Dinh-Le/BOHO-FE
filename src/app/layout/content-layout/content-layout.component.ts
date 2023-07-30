import { Component, OnInit } from '@angular/core';
import { tick } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingService } from '@app/loading.service';
import { filter } from 'rxjs';

interface NavItem {
  active: boolean;
  title: string;
  path: string;
}

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.css']
})
export class ContentLayoutComponent implements OnInit {
  navItems: NavItem[] = [
    {
      active: false,
      title: 'Giám sát',
      path: '/monitor'
    },
    {
      active: false,
      title: 'Tìm kiếm',
      path: '/search'
    },
    {
      active: false,
      title: 'Báo cáo',
      path: '/reports'
    },
    {
      active: false,
      title: 'Cài đặt',
      path: '/settings'
    },
  ]

  constructor(
    router: Router,
    private loadingService: LoadingService
  ) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const currentPath = (event as NavigationEnd).url;
        for (const item of this.navItems) {
          item.active = item.path === currentPath;
        }
      });
  }

  get loading() {
    return this.loadingService.loading;
  }

  get loadingConfig() {
    return this.loadingService.config;
  }

  ngOnInit(): void {
  }
}
