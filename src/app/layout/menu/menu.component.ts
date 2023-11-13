import { Component, Input } from '@angular/core';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss'],
})
export class MenuComponent {
  @Input()
  menuItems!: MenuItem[];

  @Input()
  loading: boolean = false;

  isSelected = false;
  isExpanded = false;
  isDisabled = false;
}
