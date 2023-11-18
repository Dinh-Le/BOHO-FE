import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ListViewItem } from './list-view-item';

@Component({
  selector: 'app-list-view',
  templateUrl: 'list-view.component.html',
  styleUrls: ['list-view.component.scss'],
})
export class ListViewComponent implements OnInit {
  @Input()
  title: string = '';

  @Input()
  items: ListViewItem[] = [];

  @Output()
  remove: EventEmitter<ListViewItem> = new EventEmitter(true);

  @Output()
  save: EventEmitter<ListViewItem> = new EventEmitter(true);

  @Output()
  change: EventEmitter<ListViewItem> = new EventEmitter(true);

  ngOnInit(): void {}

  trackById(_: any, item: ListViewItem) {
    return item.id;
  }

  onItemClick(item: ListViewItem) {
    const selectedItem = this.items.find((e) => e.isSelected);
    
    if (selectedItem?.id === item.id) {
      return;
    }

    if (selectedItem) {
      selectedItem.isSelected = false;
      
      if (selectedItem.isEditable) {
        this.onSaveClick(selectedItem);
      }
    }

    item.isSelected = true;
    this.change.emit(item);
  }

  onSaveClick(item: ListViewItem) {
    this.save.emit(item);
    item.isEditable = false;
  }

  onRemoveClick(item: ListViewItem) {
    this.remove.emit(item);
  }
}
