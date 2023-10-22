import { Component, OnInit } from '@angular/core';
import { CustomListViewItem } from '@modules/manage/custom-list-view/custom-list-view-item';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
})
export class PresetSettingsComponent implements OnInit {
  presetList: CustomListViewItem[] = [];

  ngOnInit(): void {
    this.presetList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      value: e,
      text: `Điểm giám sát ${e}`,
      selected: false,
    }));
  }

  load() {}

  play() {
    console.log(this.presetList);
  }
}
