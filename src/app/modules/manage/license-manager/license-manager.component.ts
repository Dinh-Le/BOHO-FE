import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import { BehaviorSubject, Observable, Subject, catchError, of, share, switchMap } from 'rxjs';
import {
  LicenseKeyInfo,
  LicenseKeyService,
} from 'src/app/data/service/license_key.service';
import {
  Level2Menu,
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-license-manager',
  templateUrl: 'license-manager.component.html',
  styleUrls: ['license-manager.component.scss'],
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

  refreshLicenseKeyTrigger = new BehaviorSubject<number>(0);
  licenseKeyData$: Observable<LicenseKeyInfo> = this.refreshLicenseKeyTrigger
    .asObservable()
    .pipe(
      switchMap(() => this.licenseKeyService.find()),
      switchMap(({ data }) => of(data)),
      share(),
      catchError((err: HttpErrorResponse) => {
        this.toastService.showError(
          `Fetch license infor failed with error: ${
            err.error?.message ?? err.message
          }`
        );
        return of({
          license_key: '',
          data: [],
        } as LicenseKeyInfo);
      })
    );

  constructor(
    private navigationService: NavigationService,
    private licenseKeyService: LicenseKeyService,
    private toastService: ToastService
  ) {
    navigationService.level2 = Level2Menu.SYSTEM;
    navigationService.level3 = Level3Menu.LICENSE_MANAGER;
    this.refreshLicenseKeyTrigger.next(0);
  }

  onMenuItemClick(_: SelectItemModel) {
    this.navigationService.level2 = Level2Menu.SYSTEM;
    this.navigationService.level3 = Level3Menu.MILESTONE_VMS;
    this.navigationService.navigate();
  }

  changeLicenseKey() {
    const licenseKey = prompt('Please input your license key');
    if (!licenseKey) {
      return;
    }

    this.licenseKeyService.update(licenseKey).subscribe({
      complete: () => {
        this.toastService.showSuccess('Change the license key successfully');
        this.refreshLicenseKeyTrigger.next(0);
      },
      error: (err: HttpErrorResponse) =>
        this.toastService.showError(
          `Change the license key failed with error: ${
            err.error?.message ?? err.message
          }`
        ),
    });
  }
}
