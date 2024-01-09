import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EditableListViewItemModel } from './editable-list-view-item.model';

@Component({
  selector: 'app-editable-list-view',
  templateUrl: 'editable-list-view.component.html',
  styleUrls: ['editable-list-view.component.scss'],
})
export class EditableListViewComponent {
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

  trackById(_: any, item: EditableListViewItemModel) {
    return item.id;
  }

  onItemClick(ev: Event, item: EditableListViewItemModel) {
    ev.stopPropagation();

    const selectedItem = this.items.find((e) => e.isSelected);
    if (selectedItem?.id === item.id) {
      return;
    }

    if (selectedItem) {
      selectedItem.isSelected = false;

      if (selectedItem.isEditable) {
        this.onSaveClick(ev, selectedItem);
      }
    }

    item.isSelected = true;
    this.change.emit(item);
  }

  onEditClick(ev: Event, item: EditableListViewItemModel) {
    ev.stopPropagation();
    item.isEditable = true;
  }

  onSaveClick(ev: Event, item: EditableListViewItemModel) {
    ev.stopPropagation();
    this.save.emit(item);
    item.isEditable = false;
  }

  onRemoveClick(ev: Event, item: EditableListViewItemModel) {
    ev.stopPropagation();
    this.remove.emit(item);
  }
}
