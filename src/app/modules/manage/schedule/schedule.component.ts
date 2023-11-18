import { Component, OnInit, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import { RowData } from '../rule/rule.component';

interface RowItemModel extends ExpandableTableRowData {
  id: string;
  name: string;
  scheduleData: boolean[][];
  isEditable?: boolean;
}

@Component({
  selector: 'app-schedule',
  templateUrl: 'schedule.component.html',
  styleUrls: ['../shared/my-input.scss'],
})
export class ScheduleComponent implements OnInit {
  _activatedRoute = inject(ActivatedRoute);
  _cameraId: string | undefined;
  daysInWeek: string[] = ['H', 'B', 'T', 'N', 'S', 'B', 'C'];
  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên lịch trình',
      prop: 'name',
    },
  ];

  ngOnInit(): void {
    this._activatedRoute.parent?.params.subscribe(({cameraId}) => {
      this._cameraId = cameraId;
    });
  }

  add() {
    this.data.push({
      id: v4(),
      name: '',
      isExpanded: true,
      isEditable: true,
      scheduleData: this.daysInWeek.map((e) => Array(48).fill(true)),
    });
  }

  toggle(item: RowItemModel, i: number, j: number) {
    if (!item.isEditable) {
      return;
    }

    item.scheduleData[i][j] = !item.scheduleData[i][j];
  }

  save(item: RowItemModel) {
    item.isEditable = false;
  }

  remove(item: RowItemModel) {
    this.data = this.data.filter((e) => e.id !== item.id);
  }

  get ruleUrl() {
    return `/manage/device-rule/${this._cameraId}/rule`;
  }
}
