import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeViewItemModel } from './tree-view-item.model';

@Component({
  selector: 'app-tree-view-item-dropdown',
  templateUrl: 'tree-view-item-dropdown.component.html',
  styleUrls: ['tree-view-item-dropdown.component.scss'],
})
export class TreeViewItemDropDownComponent {
  @Input()
  items: TreeViewItemModel[] = [];

  @Input()
  selectedItems: TreeViewItemModel[] = [];

  @Output()
  itemClick = new EventEmitter<TreeViewItemModel>();
}
