import { Component, OnInit } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ListViewItem } from '../list-view/list-view-item';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
  styleUrls: ['../../shared/my-input.scss'],
})
export class PresetSettingsComponent implements OnInit {
  presetList: ListViewItem[] = [];
  selectedItem: ListViewItem|undefined;

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

  remove(item: ListViewItem) {
    this.presetList = this.presetList.filter((e) => e.id !== item.id);
  }

  save(item: ListViewItem) {}
}
