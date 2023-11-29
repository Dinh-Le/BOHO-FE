import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { TreeViewItemModel } from './tree-view-item.model';
import { TreeViewConfig } from './tree-view-config';

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

  @Input() config!: TreeViewConfig;

  @Input() itemTemplate?: TemplateRef<any>;

  @Output()
  itemClick = new EventEmitter<TreeViewItemModel>();
}
