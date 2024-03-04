import {
  Component,
  DoCheck,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';

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
export class ExpandableTableComponent implements DoCheck {
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

  private _lastItemCount: number = 0;

  ngDoCheck(): void {
    if (this._lastItemCount == this.data.length) {
      return;
    }

    const expandingItems = this.data.filter((item) => item.isExpanded);

    if (expandingItems.length > 1) {
      expandingItems.forEach((item, index) => {
        item.isExpanded = index === expandingItems.length - 1;
      });
    }

    this._lastItemCount = this.data.length;
  }

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

  toggle(row: any) {
    this.data.forEach((item) => {
      if (item[this.rowKey] !== row[this.rowKey]) {
        item.isExpanded = false;
      } else {
        item.isExpanded = !item.isExpanded;
      }
    });
  }
}
