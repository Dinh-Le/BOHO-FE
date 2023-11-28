import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeViewItemModel } from './tree-view-item.model';

@Component({
  selector: 'app-tree-view-item',
  templateUrl: 'tree-view-item.component.html',
  styleUrls: ['tree-view-item.component.scss'],
})
export class TreeViewItemComponent {
  @Input()
  item?: TreeViewItemModel;

  @Input()
  selectedItems: TreeViewItemModel[] = [];

  @Output()
  click = new EventEmitter<TreeViewItemModel>();

  isHover: boolean = false;

  get isSelected() {
    return this.selectedItems.some((e) => e.id === this.item?.id);
  }
  
  toggleExpand(event: Event) {
    event.stopPropagation();
    if (this.item) {
      this.item.isExpanded = !this.item.isExpanded;
    }
  }
}
