import { Component } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-patrol-settings',
  templateUrl: 'patrol-settings.component.html',
})
export class PatrolSettingsComponent {
  patrolList: SelectItemModel[] = [];
  presetList: SelectItemModel[] = [];

  ngOnInit(): void {
    this.patrolList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      value: e,
      label: `Patrol ${e}`,
      selected: false,
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

  remove(item: SelectItemModel) {
    this.patrolList = this.patrolList.filter((e) => e.value !== item.value);
  }

  removePreset(item: SelectItemModel) {
    this.presetList = this.presetList.filter((e) => e.value !== item.value);
  }
}
