import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from '../menu-item';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-camera-detail',
  templateUrl: 'camera-detail.component.html',
})
export class CameraDetailComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      icon: 'bi-info-circle',
      title: 'Thông tin',
      path: '/manage/camera/{id}/info',
    },
    {
      icon: 'bi-arrows-move',
      title: 'Điểm giám sát',
      path: '/manage/camera/{id}/preset-settings',
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Tuần tra',
      path: '/manage/camera/{id}/patrol-settings',
    },
    {
      icon: 'bi-calendar3',
      title: 'Lịch trình PTZ',
      path: '/manage/camera/{id}/tour-settings',
    },
  ];
  router = inject(Router);

  constructor(activatedRoute: ActivatedRoute) {
    const id = activatedRoute.snapshot.params['cameraId'];
    this.menuItems = this.menuItems.map(e => Object.assign(e, {
      path: e.path?.replace('{id}', id)
    }))
  }

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
