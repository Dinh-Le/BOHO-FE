import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { EditableListViewItemModel } from './editable-list-view-item.model';

@Component({
  selector: 'app-editable-list-view',
  templateUrl: 'editable-list-view.component.html',
  styleUrls: ['editable-list-view.component.scss'],
})
export class EditableListViewComponent implements OnInit {
  @Input()
  title: string = '';

  @Input()
  items: EditableListViewItemModel[] = [];

  @Output()
  remove: EventEmitter<EditableListViewItemModel> = new EventEmitter(true);

  @Output()
  save: EventEmitter<EditableListViewItemModel> = new EventEmitter(true);

  @Output()
  change: EventEmitter<EditableListViewItemModel> = new EventEmitter(true);

  ngOnInit(): void {}

  trackById(_: any, item: EditableListViewItemModel) {
    return item.id;
  }

  onItemClick(item: EditableListViewItemModel) {
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

  onSaveClick(item: EditableListViewItemModel) {
    this.save.emit(item);
    item.isEditable = false;
  }

  onRemoveClick(item: EditableListViewItemModel) {
    this.remove.emit(item);
  }
}
