import { Component } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
  timePeriods: SelectItemModel[] = [
    {
      value: '30p',
      label: '30p trước',
    },
    {
      value: '1h',
      label: '1h trước',
    },
    {
      value: '6h',
      label: '6h trước',
    },
    {
      value: '12h',
      label: '12h trước',
    },
    {
      value: '24h',
      label: '24h trước',
    },
    {
      value: '1d',
      label: 'Hôm qua',
    },
    {
      value: '1w',
      label: 'Tuần trước',
    },
  ];
  gridCol: number = 5;
  viewMode: 'grid' | 'map' | 'list' = 'grid';
}
