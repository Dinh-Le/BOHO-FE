import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { TreeViewItemModel } from './tree-view-item.model';
import { TreeViewConfig } from './tree-view-config';

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

  @Input() config!: TreeViewConfig;

  @Input() itemTemplate?: TemplateRef<any>;

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
