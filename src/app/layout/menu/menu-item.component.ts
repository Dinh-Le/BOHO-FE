import { Component, Input } from '@angular/core';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-menu-item',
  templateUrl: 'menu-item.component.html',
  styleUrls: ['menu-item.component.scss'],
})
export class MenuItemComponent {
  @Input()
  item!: MenuItem;

  isExpanded: boolean = false;

  get hasChild() {
    return this.item.children && this.item.children.length > 0;
  }
}