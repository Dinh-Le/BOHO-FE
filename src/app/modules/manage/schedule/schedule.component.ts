import { Component, OnInit, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';

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

  get ruleUrl() {
    return `/manage/device-rule/${this._cameraId}/rule`;
  }
}
