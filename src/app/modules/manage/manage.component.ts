import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from './menu-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  router = inject(Router);

  menuLevel2: MenuItem[] = [
    {
      icon: 'bi-laptop',
      title: 'Bảng thông tin',
      onclick: null,
    },
    {
      icon: 'bi-gpu-card',
      title: 'Thiết bị',
      onclick: null,
    },
    {
      icon: 'bi-camera-video',
      title: 'Camera',
      path: '/manage/camera',
      onclick: null,
    },
    {
      icon: 'bi-list-check',
      title: 'Quy tắc',
      path: '/manage/rule',
      onclick: null,
    },
    {
      icon: 'bi-clock',
      title: 'Lịch trình',
      path: '/manage/schedule',
    },
    {
      icon: 'bi-exclamation-triangle',
      title: 'Cảnh báo',
      onclick: null,
    },
    {
      icon: 'bi-gear',
      title: 'Cài đặt',
      onclick: null,
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
  }

  onMenuLevel2ItemClick(item: MenuItem) {
    console.log(item);
    let selectedItem = this.menuLevel2.find((item) => item.selected);
    if (selectedItem !== undefined) {
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
