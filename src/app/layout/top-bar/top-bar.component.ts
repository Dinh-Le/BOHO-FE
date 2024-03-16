import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JWTTokenService } from '@app/services/jwt-token.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import {
  Level1Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { SidebarActions } from 'src/app/state/sidebar.action';
import { SidebarState } from 'src/app/state/sidebar.state';
import { ChangePasswordComponent } from '../change-password/change-password.component';

interface NavItem {
  isActive?: boolean;
  title: string;
  path: string;
  icon: string;
  level: Level1Menu;
}

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
  navItems: NavItem[] = [
    {
      title: 'Tìm kiếm',
      path: '/search',
      icon: 'search',
      level: Level1Menu.SEARCH,
    },
    {
      title: 'Cảnh báo',
      path: '/alert',
      icon: 'alert',
      level: Level1Menu.ALERT,
    },
    // {
    //   title: 'Báo cáo',
    //   path: '/reports',
    //   icon: 'report',
    //   level: Level1Menu.REPORT,
    // },
    {
      title: 'Quản trị',
      path: '/manage',
      icon: 'setting',
      level: Level1Menu.MANAGE,
    },
  ];

  passwordFormControl = new FormControl<string>("", [Validators.required])

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private store: Store<{ sidebar: SidebarState }>,
    private tokenService: JWTTokenService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.navItems = this.navItems.map((e) =>
      Object.assign(e, {
        isActive: e.level === this.navigationService.level1,
      })
    );
  }

  toggleSidebar(event: Event) {
    this.store.dispatch(SidebarActions.toggle());
    event.stopPropagation();
  }

  logout() {
    this.tokenService.reset();
    this.router.navigateByUrl('/login');
  }

  onMenuItemClick(item: NavItem) {
    this.navigationService.level1 = item.level;
    this.navItems = this.navItems.map((e) =>
      Object.assign(e, {
        isActive: e.level === this.navigationService.level1,
      })
    );
    this.navigationService.navigate();
  }

  showChangePasswordDialog() {
    this.modalService.open(ChangePasswordComponent, { size: 'sm' });
  }

  changePassword() {

  }
}
