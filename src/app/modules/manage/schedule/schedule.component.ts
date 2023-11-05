import { Component, OnInit } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { faL } from '@fortawesome/free-solid-svg-icons';

interface RowItemModel extends ExpandableTableRowData {
  id: string;
  name: string;
  formData: {
    editable: boolean;
    name: string;
    scheduleData: boolean[][];
  };
}

@Component({
  selector: 'app-schedule',
  templateUrl: 'schedule.component.html',
  styleUrls: ['schedule.component.scss', '../shared/my-input.scss'],
})
export class ScheduleComponent implements OnInit {
  daysInWeek: string[] = ['H', 'B', 'T', 'N', 'S', 'B', 'C'];
  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên lịch trình',
      prop: 'name',
    },
  ];

  ngOnInit(): void {}

  add() {
    this.data.push({
      id: v4(),
      name: '',
      isExpanded: true,
      formData: {
        editable: true,
        name: '',
        scheduleData: this.daysInWeek.map((e) => Array(24).fill(false)),
      },
    });
  }

  save(item: RowItemModel) {
    item.formData.editable = false;
    item.name = item.formData.name;
  }

  remove(item: RowItemModel) {
    this.data = this.data.filter((e) => e.id !== item.id);
  }
}
