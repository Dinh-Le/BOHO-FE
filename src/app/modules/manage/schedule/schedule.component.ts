import { Component, OnInit } from '@angular/core';
import { MenuItem } from '../menu-item';
import { ScheduleItem } from './schedule-item';
import * as moment from 'moment';
import * as uuid from 'uuid';

@Component({
  selector: 'app-schedule',
  templateUrl: 'schedule.component.html',
  styleUrls: ['schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  daysInWeek: string[] = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'];
  menuItems: MenuItem[] = [
    {
      icon: 'bi-plus',
      title: 'Thêm',
      onclick: this.add.bind(this),
    },
  ];
  items: ScheduleItem[] = [
    {
      id: 1,
      name: 'Lịch trình 1',
      startTime: moment('00:00', 'HH:mm').toDate(),
      endTime: moment('05:00', 'HH:mm').toDate(),
      days: ['0', '1', '2', '3'],
    },
    {
      id: 2,
      name: 'Lịch trình 2',
      startTime: moment('05:00', 'HH:mm').toDate(),
      endTime: moment('10:00', 'HH:mm').toDate(),
      days: ['0', '1', '2', '3'],
    },
    {
      id: 3,
      name: 'Lịch trình 3',
      startTime: moment('10:00', 'HH:mm').toDate(),
      endTime: moment('20:00', 'HH:mm').toDate(),
      days: ['0', '1', '2', '3'],
    },
    {
      id: 4,
      name: 'Lịch trình 4',
      startTime: moment('20:00', 'HH:mm').toDate(),
      endTime: moment('23:59', 'HH:mm').toDate(),
      days: ['0', '1', '2', '3'],
    },
  ];

  ngOnInit(): void {}

  trackById(_: any, item: ScheduleItem) {
    return item.id;
  }

  add() {
    this.items.push({
      id: uuid.v4(),
      name: 'Lịch trình',
      startTime: new Date(),
      endTime: new Date(),
      days: [],
    });
  }

  remove(item: ScheduleItem) {
    this.items = this.items.filter((e) => e.id !== item.id);
  }

  toggleDay(item: ScheduleItem, index: number) {
    if (item.days.includes(index.toString())) {
      item.days = item.days.filter((e) => e !== index.toString());
    } else {
      item.days.push(index.toString());
    }
  }
}
