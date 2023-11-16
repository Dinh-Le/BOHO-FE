import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from './menu-item';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
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

  menuLevel2: MenuItem[] = [
    {
      icon: 'bi-laptop',
      title: 'Bảng thông tin',
    },
    {
      icon: 'bi-diagram-3',
      title: 'Hệ thống',
      path: '/manage/system',
    },
    {
      icon: 'bi-pc-horizontal',
      title: 'Node',
      path: '/manage/group-node',
    },
    {
      icon: 'bi-camera-video',
      title: 'Camera',
      path: '/manage/group-camera',
    },
    {
      icon: 'bi-list-check',
      title: 'Quy tắc',
      path: '/manage/rule',
    },
    {
      icon: 'bi-car-front-fill',
      title: 'Biển số xe',
      path: '/manage/vehicle-list',
    },
    {
      icon: 'bi-plugin',
      title: 'Tích hợp',
    },
  ];

  ngOnInit(): void {
    const currentUrl = this.router.url;
    const menuItem = this.menuLevel2.find(
      (e) => e.path && currentUrl.startsWith(e.path)
    );
    if (menuItem) {
      menuItem.selected = true;
    }

    this.store
      .pipe(select('sidebar'), select('selectedMenuItem'))
      .subscribe((item) => {
        
      });
  }

  onMenuLevel2ItemClick(item: MenuItem) {
    let selectedItem = this.menuLevel2.find((item) => item.selected);
    if (selectedItem) {
      selectedItem.selected = false;
    }

    item.selected = true;
    if (item.onclick) {
      item.onclick();
    }

    if (item.path) {
      this.router.navigateByUrl(item.path);
    }
  }
}
