import { Component, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { v4 } from 'uuid';
import { SelectItemModel } from '@shared/models/select-item-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventSourceComponent } from './event-source/event-source.component';

interface RowItemModel extends ExpandableTableRowData {
  id: string;
  name?: string;
  type?: SelectItemModel;
  source?: SelectItemModel;
  cameraGuid?: string;
  isSendSnapshot?: boolean;
  isEditable?: boolean;
}

@Component({
  selector: 'app-integration',
  templateUrl: 'integration.component.html',
  styleUrls: ['../shared/my-input.scss'],
})
export class IntegrationComponent {
  _modalService = inject(NgbModal);

  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên',
      prop: 'name',
      sortable: true,
    },
    {
      label: 'Loại',
      prop: 'type.label',
      sortable: true,
    },
    {
      label: 'Đích',
      prop: 'source.label',
      sortable: true,
    },
  ];
  types: SelectItemModel[] = ['Milestone'].map((e) => ({
    value: e,
    label: e,
  }));
  sources: SelectItemModel[] = [1, 2, 3]
    .map((e) => `Milestone server ${e}`)
    .map((e) => ({
      value: e,
      label: e,
    }));

  add() {
    const newRow: RowItemModel = {
      id: v4(),
      isEditable: true,
      isExpanded: true,
    };
    this.data.push(newRow);
  }

  remove(row: RowItemModel) {
    this.data = this.data.filter((e) => e.id !== row.id);
  }

  onEventSourceClick(item: RowItemModel) {
    this._modalService.open(EventSourceComponent, {
      size: 'xl',
      centered: true,
    });
  }
}
