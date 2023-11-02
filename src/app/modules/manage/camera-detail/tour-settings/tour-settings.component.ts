import { Component, OnInit } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';

interface PtzTour {
  startHour: string;
  startMin: string;
  endHour: string;
  endMin: string;
  day?: SelectItemModel;
  type: string;
  patrol?: SelectItemModel;
  color?: SelectItemModel;
}

@Component({
  selector: 'app-tour-settings',
  templateUrl: 'tour-settings.component.html',
  styleUrls: ['tour-settings.component.scss'],
})
export class TourSettingsComponent implements OnInit {
  colors: SelectItemModel[] = [
    {
      value: 'green',
      label: 'Xanh lá',
    },
    {
      value: 'red',
      label: 'Đỏ',
    },
    {
      value: 'cygan',
      label: 'Xanh lơ',
    },
  ];
  daysInWeek: SelectItemModel[] = [
    'T.Hai',
    'T.Ba',
    'T.Tư',
    'T.Năm',
    'T.Sáu',
    'T.Bảy',
    'C.Nhật',
  ].map((e, index) => ({
    value: index,
    label: e,
  }));
  hoursInDay: number[] = Array(24)
    .fill(0)
    .map((_, index) => index);
  toursInWeek: number[][] = this.daysInWeek.map(() => Array(24).fill(''));
  data: PtzTour[] = [
    {
      startHour: '00',
      startMin: '00',
      endHour: '03',
      endMin: '59',
      day: {
        value: 0,
        label: 'T.Hai',
      },
      type: '',
      color: {
        value: 'red',
        label: 'Đỏ',
      },
    },
  ];

  ngOnInit(): void {
    for (let tour of this.data) {
    }
  }
}
