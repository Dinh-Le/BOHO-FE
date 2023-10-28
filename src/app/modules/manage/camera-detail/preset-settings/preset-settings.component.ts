import { Component, OnInit } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
})
export class PresetSettingsComponent implements OnInit {
  presetList: SelectItemModel[] = [];

  ngOnInit(): void {
    this.presetList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      value: e,
      label: `Điểm giám sát ${e}`,
      selected: false,
    }));
  }

  trackByValue(_: any, item: SelectItemModel) {
    return item.value;
  }

  load() {}

  play() {
    console.log(this.presetList);
  }

  remove(item: SelectItemModel) {
    this.presetList = this.presetList.filter((e) => e.value !== item.value);
  }
}
