import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from '../menu-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-camera-detail',
  templateUrl: 'camera-detail.component.html',
})
export class CameraDetailComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      icon: 'bi-info-circle',
      title: 'Thông tin',
      path: '/manage/camera-detail/info',
    },
    {
      icon: 'bi-arrows-move',
      title: 'Điểm giám sát',
      path: '/manage/camera-detail/preset-settings',
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Tuần tra',
      path: '/manage/camera-detail/patrol-settings',
    },
    {
      icon: 'bi-calendar3',
      title: 'Lịch trình PTZ',
      path: '/manage/camera-detail/tour-settings',
    },
  ];
  router = inject(Router);

  ngOnInit(): void {
    const currentUrl = this.router.url;
    const currentMenuItem = this.menuItems.find((e) => e.path === currentUrl);
    if (currentMenuItem) {
      currentMenuItem.selected = true;
    }
  }

  handleMenuItemClicked(menuItem: MenuItem) {
    this.menuItems.forEach((e) => (e.selected = false));
    menuItem.selected = true;
    this.router.navigateByUrl(menuItem.path || '');
  }
}
