import { Component, Input, TemplateRef } from '@angular/core';

export interface ColumnConfig {
  label: string;
  prop: string;
  sortable?: boolean;
  width?: string;
  headerTemplateRef?: TemplateRef<any>;
  contentTemplateRef?: TemplateRef<any>;
}

export interface ExpandableTableRowData {
  isExpanded?: boolean;
}

export class ExpandableTableRowItemModelBase implements ExpandableTableRowData {
  // indicate that the row is newly created
  isNew?: boolean;
  isEditable?: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-expandable-table',
  templateUrl: 'expandable-table.component.html',
  styleUrls: ['expandable-table.component.scss'],
})
export class ExpandableTableComponent {
  @Input()
  columns: ColumnConfig[] = [];

  @Input()
  data: any[] = [];

  @Input()
  collapseContentTemplateRef: TemplateRef<any> | undefined;

  @Input()
  rowKey: string = 'id';

  @Input()
  classNames: string = '';

  trackById(_: any, data: any) {
    return data[this.rowKey];
  }

  selectByPath(o: any, path: string) {
    try {
      return path.split('.').reduce((o, key) => o[key], o);
    } catch {
      return '';
    }
  }
}
