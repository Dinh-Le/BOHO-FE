import { Component } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ListViewItem } from '../list-view/list-view-item';

@Component({
  selector: 'app-patrol-settings',
  templateUrl: 'patrol-settings.component.html',
  styleUrls: ['../../shared/my-input.scss']
})
export class PatrolSettingsComponent {
  patrols: ListViewItem[] = [];
  presetList: SelectItemModel[] = [];

  ngOnInit(): void {
    this.patrols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      id: e.toString(),
      label: `Patrol ${e}`,
    }));
    this.presetList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      value: e,
      label: `Điểm giám sát ${e}`,
      selected: false,
    }));
  }

  trackByValue(_: any, item: SelectItemModel) {
    return item.value;
  }

  add() {}

  play() {}

  remove(item: ListViewItem) {
    this.patrols = this.patrols.filter((e) => e.id !== item.id);
  }

  removePreset(item: SelectItemModel) {
    this.presetList = this.presetList.filter((e) => e.value !== item.value);
  }
}
