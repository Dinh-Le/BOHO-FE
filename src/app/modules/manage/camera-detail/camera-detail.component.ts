import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import { Device } from 'src/app/data/schema/boho-v2';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'app-camera-detail',
  templateUrl: 'camera-detail.component.html',
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
  }[] = [
    {
      icon: 'bi-info-circle',
      title: 'Thông tin',
      path: '/info',
      visible: true,
    },
    {
      icon: 'bi-gear-fill',
      title: 'Cài đặt',
      path: '/settings',
      visible: true,
    },
    {
      icon: 'bi-arrows-move',
      title: 'Điểm giám sát',
      path: '/preset-settings',
      visible: false,
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Tuần tra',
      path: '/patrol-settings',
      visible: false,
    },
    {
      icon: 'bi-calendar3',
      title: 'Lịch trình PTZ',
      path: '/tour-settings',
      visible: false,
    },
  ];

  ngOnInit(): void {
    this._activatedRoute.params
      .pipe(
        switchMap(({ nodeId, cameraId }) =>
          this._deviceService.find(nodeId, cameraId)
        )
      )
      .subscribe({
        next: ({ data }) => {
          this._camera = data;

          for (let i = 2; i < this.menuItems.length; i++) {
            this.menuItems[i].visible = data.camera.type === 'PTZ';
          }
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });

    const { url } = this._router;
    const currentMenuItem = this.menuItems.find((e) => url.endsWith(e.path!));
    if (currentMenuItem) {
      currentMenuItem.selected = true;
    }
  }

  handleMenuItemClicked(menuItem: any) {
    this.menuItems.forEach((e) => (e.selected = false));
    menuItem.selected = true;
    this._router.navigateByUrl(
      `/manage/node/${this._camera?.node_id}/camera/${this._camera?.id}${menuItem.path}`
    );
  }
}
