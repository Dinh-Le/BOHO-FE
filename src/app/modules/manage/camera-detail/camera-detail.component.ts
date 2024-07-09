import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService } from 'src/app/data/service/device.service';
import { Device } from 'src/app/data/schema/boho-v2';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';
import { HandoverSettingsComponent } from './handover-settings/handover-settings.component';

@Component({
  selector: 'app-camera-detail',
  templateUrl: 'camera-detail.component.html',
  host: {
    class: 'flex-grow-1 d-flex flex-column',
  },
})
export class CameraDetailComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _deviceService = inject(DeviceService);
  private _toastService = inject(ToastService);
  private _router = inject(Router);
  private _camera: Device | undefined;

  menuItems: {
    icon: string;
    title: string;
    path: string;
    visible?: boolean;
    selected?: boolean;
    cameraType: 'ptz' | 'static' | 'both';
  }[] = [
    {
      icon: 'bi-info-circle',
      title: 'Thông tin',
      path: '/info',
      visible: true,
      cameraType: 'both',
    },
    {
      icon: 'bi-gear-fill',
      title: 'Cài đặt',
      path: '/settings',
      visible: true,
      cameraType: 'both',
    },
    {
      icon: 'bi-arrows-move',
      title: 'Điểm giám sát',
      path: '/preset-settings',
      visible: false,
      cameraType: 'ptz',
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Tuần tra',
      path: '/patrol-settings',
      visible: false,
      cameraType: 'ptz',
    },
    {
      icon: 'bi-calendar3',
      title: 'Lịch trình PTZ',
      path: '/tour-settings',
      visible: false,
      cameraType: 'ptz',
    },
    {
      icon: 'bi-hand-index',
      title: 'Chuyền PTZ',
      path: '/chuyen-ptz',
      visible: false,
      cameraType: 'static',
    },
  ];

  isChuyenPtzActive = false;
  _currentComponent: any;

  ngOnInit(): void {
    this._activatedRoute.params.subscribe({
      next: ({ nodeId, cameraId }) => {
        this._deviceService.find(nodeId, cameraId).subscribe({
          next: ({ data: camera }) => {
            this._camera = camera;

            for (let i = 0; i < this.menuItems.length; i++) {
              const cameraType = this.menuItems[i].cameraType;
              this.menuItems[i].visible =
                cameraType === 'both' ||
                cameraType === this._camera.camera.type.toLowerCase();
            }
          },
        });
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });

    const { url } = this._router;
    const currentMenuItem = this.menuItems.find((e) => url.endsWith(e.path!));
    if (currentMenuItem) {
      currentMenuItem.selected = true;
      this.isChuyenPtzActive = currentMenuItem.path === '/chuyen-ptz';
    }
  }

  handleMenuItemClicked(menuItem: any) {
    this.menuItems.forEach((e) => (e.selected = false));
    menuItem.selected = true;

    this.isChuyenPtzActive = menuItem.path === '/chuyen-ptz';

    this._router.navigateByUrl(
      `/manage/node/${this._camera?.node_id}/camera/${this._camera?.id}${menuItem.path}`
    );
  }

  onActivate(event: any) {
    this._currentComponent = event;
  }

  add() {
    (this._currentComponent as HandoverSettingsComponent).add();
  }

  remove() {
    (this._currentComponent as HandoverSettingsComponent).remove();
  }
}
