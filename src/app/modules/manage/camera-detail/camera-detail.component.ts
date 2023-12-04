import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from '../menu-item';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-camera-detail',
  templateUrl: 'camera-detail.component.html',
})
export class CameraDetailComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _nodeId: string = '';
  private _cameraId: string = '';
  menuItems: MenuItem[] = [
    {
      icon: 'bi-info-circle',
      title: 'Thông tin',
      path: '/info',
    },
    {
      icon: 'bi-arrows-move',
      title: 'Điểm giám sát',
      path: '/preset-settings',
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Tuần tra',
      path: '/patrol-settings',
    },
    {
      icon: 'bi-calendar3',
      title: 'Lịch trình PTZ',
      path: '/tour-settings',
    },
  ];

  ngOnInit(): void {
    this._activatedRoute.params.subscribe(({ nodeId, cameraId }) => {
      this._nodeId = nodeId;
      this._cameraId = cameraId;
    });

    const { url } = this._router;
    const currentMenuItem = this.menuItems.find((e) => url.endsWith(e.path!));
    if (currentMenuItem) {
      currentMenuItem.selected = true;
    }
  }

  handleMenuItemClicked(menuItem: MenuItem) {
    this.menuItems.forEach((e) => (e.selected = false));
    menuItem.selected = true;
    this._router.navigateByUrl(
      `/manage/node/${this._nodeId}/camera/${this._cameraId}${menuItem.path}`
    );
  }
}
