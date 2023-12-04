import { Component, OnInit } from '@angular/core';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
  styleUrls: ['../../shared/my-input.scss'],
})
export class PresetSettingsComponent implements OnInit {
  presetList: EditableListViewItemModel[] = [];
  selectedItem: EditableListViewItemModel|undefined;

  ngOnInit(): void {
    this.presetList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      id: e.toString(),
      label: `Điểm giám sát ${e}`,
    }));
  }

  load() {
    console.log(this.selectedItem);
  }

  play() {
    console.log(this.presetList);
  }

  remove(item: EditableListViewItemModel) {
    this.presetList = this.presetList.filter((e) => e.id !== item.id);
  }

  save(item: EditableListViewItemModel) {}
}
