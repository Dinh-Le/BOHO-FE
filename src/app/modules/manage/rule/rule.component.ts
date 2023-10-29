import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MenuItem } from '../menu-item';
import { RuleItem, mockRules } from './rule-item';
import { ColumnConfig } from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss'],
})
export class RuleComponent implements OnInit, AfterViewInit {
  @ViewChild('objectColumnTemplate', { static: true })
  objectColumnTemplate!: TemplateRef<any>;

  menuItems: MenuItem[] = [
    {
      icon: 'bi-plus',
      title: 'Thêm',
      onclick: this.add.bind(this),
    },
  ];
  rules: RuleItem[] = [];
  presets: SelectItemModel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
    value: e,
    label: `Điểm giám sát ${e}`,
  }));
  ruleTypes: SelectItemModel[] = [
    {
      value: 1,
      label: 'Đi vào vùng',
    },
    {
      value: 2,
      label: 'Đi ra khỏi vùng',
    },
    {
      value: 3,
      label: 'Đi luẩn quẩn',
    },
    {
      value: 4,
      label: 'Vượt đường kẻ trái sang phải',
    },
    {
      value: 5,
      label: 'Vượt đường kẻ phải sang trái',
    },
    {
      value: 6,
      label: 'Đối tượng để lại',
    },
  ];
  objects: SelectItemModel[] = [
    {
      value: 1,
      label: 'Người',
      icon: 'bi bi-person-walking',
    },
    {
      value: 2,
      label: 'Xe đạp',
      icon: 'fas,bicycle',
    },
    {
      value: 3,
      label: 'Xe mô-tô',
      icon: 'fas,motorcycle',
    },
    {
      value: 4,
      label: 'Ô tô',
      icon: 'fas,car-side',
    },
    {
      value: 5,
      label: 'Xe bus',
      icon: 'bi bi-bus-front-fill',
    },
    {
      value: 6,
      label: 'Xe tải',
      icon: 'bi bi-truck',
    },
  ];
  severities: SelectItemModel[] = [
    {
      value: 1,
      label: 'Thấp'
    },
    {
      value: 2,
      label: 'Bình thường',
    },
    {
      value: 3,
      label: 'Cao'
    }
  ];
  schedules: SelectItemModel[] = [1, 2, 3, 4].map(e => ({
    value: e,
    label: 'Lịch trình ' + e
  }))
  columns: ColumnConfig[] = [
    {
      label: 'Tên quy tắc',
      prop: 'name',
      sortable: true,
    },
    {
      label: 'Điểm giám sát',
      prop: 'diemGiamSat.name',
      sortable: true,
    },
    {
      label: 'Loại quy tắc',
      prop: 'type.label',
      sortable: true,
    },
    {
      label: 'Loại đối tượng',
      prop: 'objects',
      sortable: true,
    },
    {
      label: 'Lịch trình',
      prop: 'schedule.name',
      sortable: true,
    },
  ];

  ngOnInit(): void {
    this.rules = mockRules.map((e) => ({ ...e }));
    this.rules[0].isExpanded = true;
    this.rules[0].isEditable = true;
  }

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên quy tắc',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Điểm giám sát',
        prop: 'diemGiamSat.name',
        sortable: true,
      },
      {
        label: 'Loại quy tắc',
        prop: 'type.label',
        sortable: true,
      },
      {
        label: 'Loại đối tượng',
        prop: 'objects',
        sortable: true,
        contentTemplateRef: this.objectColumnTemplate
      },
      {
        label: 'Lịch trình',
        prop: 'schedule.name',
        sortable: true,
      },
    ];
  }

  add() {}
}
