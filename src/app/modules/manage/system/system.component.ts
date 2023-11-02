import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';

interface ExternalSystemRowData extends ExpandableTableRowData {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  status: boolean;
  formData: ExternalSystemFormData;
}

interface ExternalSystemFormData {
  name?: string;
  host?: string;
  port?: number;
  userId?: string;
  password?: string;
  eventPort?: number;
  editable?: boolean;
}

@Component({
  selector: 'app-system',
  templateUrl: 'system.component.html',
  styleUrls: ['system.component.scss'],
})
export class SystemComponent implements AfterViewInit, OnInit {
  @ViewChild('statusCellTemplateRef')
  statusCellTemplateRef!: TemplateRef<any>;

  systems: SelectItemModel[] = [
    {
      value: 'milestone-vms',
      label: 'Milestone VMS',
      selected: true,
    },
    {
      value: 'smtp-mail',
      label: 'SMTP mail',
    },
  ];
  selectedSystem: SelectItemModel = this.systems[0];
  columns: ColumnConfig[] = [
    {
      label: 'Tên giao tiếp',
      prop: 'name',
      sortable: true,
    },
    {
      label: 'Loại',
      prop: 'type',
      sortable: true,
    },
    {
      label: 'Host',
      prop: 'host',
      sortable: true,
    },
    {
      label: 'Cổng',
      prop: 'port',
      sortable: true,
    },
    {
      label: 'Trạng thái',
      prop: 'status',
      sortable: true,
    },
  ];
  data: ExternalSystemRowData[] = [];

  ngOnInit(): void {
    this.data = [
      {
        id: '1',
        name: 'Milestone VMS server 1',
        type: 'Milestone Xprotect',
        host: '14.161.12.2',
        port: 4333,
        status: true,
        formData: {
          name: 'Milestone VMS server 1',
          host: '14.161.12.2',
          port: 4333,
          eventPort: 4444,
        },
      },
    ];
  }

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên giao tiếp',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Loại',
        prop: 'type',
        sortable: true,
      },
      {
        label: 'Host',
        prop: 'host',
        sortable: true,
      },
      {
        label: 'Cổng',
        prop: 'port',
        sortable: true,
      },
      {
        label: 'Trạng thái',
        prop: 'status',
        sortable: true,
        contentTemplateRef: this.statusCellTemplateRef,
      },
    ];
  }

  selectSystem(item: SelectItemModel) {
    this.selectedSystem.selected = false;

    this.selectedSystem = item;
    this.selectedSystem.selected = true;
  }

  add() {
    this.data.push({
      id: v4(),
      name: '',
      type: '',
      host: '',
      port: 0,
      status: false,
      formData: {},
    });
  }
}
