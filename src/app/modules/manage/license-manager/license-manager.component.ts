import { Component, HostBinding } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  Level2Menu,
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';

interface LicenseItemModel {
  name: string;
  unit: string;
  total: number;
  used: number;
  remained: number;
  expiredIn: string;
}

@Component({
  selector: 'app-license-manager',
  templateUrl: 'license-manager.component.html',
  styleUrls: ['license-manager.component.scss']
})
export class LicenseManagerComponent {
  @HostBinding('class') classNames = 'flex-grow-1 d-flex flex-column';

  readonly title: string = 'Thông tin bản quyền';
  readonly menuItems: SelectItemModel[] = [
    {
      value: 'license-manager',
      label: 'Bản quyền',
      selected: true,
    },
    {
      value: 'milestone-vms',
      label: 'Milestone VMS',
      selected: false,
    },
  ];
  readonly licenseData: LicenseItemModel[] = [
    'Xâm nhập vùng',
    'Vượt đường kẻ',
    'Đi luẩn quẩn',
    'Đối tượng bị bỏ lại',
    'Đối tượng bị lấy đi',
    'Phát hiện can thiệp',
    'PTZ thông minh',
    'Nhận diện biển số',
  ].map((name) => ({
    name,
    unit: 'Kênh',
    total: 50,
    used: 25,
    remained: 25,
    expiredIn: 'Không xác định',
  }));

  get licenseCode() {
    return '[Mã bản quyền]';
  }

  constructor(private navigationService: NavigationService) {
    navigationService.level2 = Level2Menu.SYSTEM;
    navigationService.level3 = Level3Menu.LICENSE_MANAGER;
  }

  onMenuItemClick(_: SelectItemModel) {
    this.navigationService.level2 = Level2Menu.SYSTEM;
    this.navigationService.level3 = Level3Menu.MILESTONE_VMS;
    this.navigationService.navigate();
  }
}
