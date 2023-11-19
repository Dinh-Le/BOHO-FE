import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { MenuItem } from 'src/app/layout/menu/menu-item';
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
      label: 'Bảng thông tin',
    },
    {
      icon: 'bi-diagram-3',
      label: 'Hệ thống',
      path: '/manage/system',
    },
    {
      icon: 'bi-pc-horizontal',
      label: 'Node',
      path: '/manage/group-node',
    },
    {
      icon: 'bi-camera-video',
      label: 'Camera',
      path: '/manage/group-camera',
    },
    {
      icon: 'bi-list-check',
      label: 'Quy tắc',
      path: '/manage/device-rule',
    },
    {
      icon: 'bi-car-front-fill',
      label: 'Biển số xe',
      path: '/manage/vehicle-list',
    },
    {
      icon: 'bi-plugin',
      label: 'Tích hợp',
      path: '/manage/integration'
    },
  ];

  _selectedSideMenuItem: MenuItem | undefined;

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const menuItem = this.menuLevel2.find(
          (e) => e.path && this.router.url.startsWith(e.path)
        );
        if (menuItem) {
          menuItem.isSelected = true;
        }
      }
    });

    this.store
      .pipe(select('sidebar'), select('selectedMenuItem'))
      .subscribe((selectedSideMenuItem: MenuItem) => {
        this._selectedSideMenuItem = selectedSideMenuItem;

        const selectedMenuLevel2Item = this.menuLevel2.find(
          (item) => item.isSelected
        );

        if (selectedMenuLevel2Item?.label === 'Node') {
          switch (selectedSideMenuItem?.level) {
            case 'node_operator':
              this.router.navigateByUrl(
                `/manage/group-node/${selectedSideMenuItem.id}/node`
              );
              break;
            case 'node':
              this.router.navigateByUrl(
                `manage/node/${selectedSideMenuItem.id}/camera`
              );
              break;
            case 'device':
              this.router.navigateByUrl(
                `manage/camera/${selectedSideMenuItem.id}/info`
              );
              break;
            default:
              this.router.navigateByUrl('/manage/group-node');
              break;
          }
        } else if (selectedMenuLevel2Item?.label === 'Camera') {
          //TODO: Change the side menu mode to 'LOGIC'
          this.router.navigateByUrl('/manage/group-camera');
        } else if (selectedMenuLevel2Item?.label === 'Quy tắc') {
          if (selectedSideMenuItem.level === 'device') {
            this.router.navigateByUrl(
              `manage/device-rule/${selectedSideMenuItem.id}/rule`
            );
          }
        }
      });
  }

  onMenuLevel2ItemClick(item: MenuItem) {
    const selectedItem = this.menuLevel2.find((item) => item.isSelected);
    if (selectedItem) {
      selectedItem.isSelected = false;
    }

    item.isSelected = true;

    if (item.path) {
      this.router.navigateByUrl(item.path);
    }

    if (item.label === 'Quy tắc') {
      if (this._selectedSideMenuItem?.level === 'device') {
        this.router.navigateByUrl(
          `manage/device-rule/${this._selectedSideMenuItem.id}/rule`
        );
      } else {
        this.router.navigateByUrl(`manage/device-rule`);
      }
    }
  }
}
