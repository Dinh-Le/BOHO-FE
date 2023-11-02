import { Component } from '@angular/core';
import { v4 } from 'uuid';

interface RowData {
  id: string;
  name: string;
  nodeCount: number;
  editable?: boolean;
}

@Component({
  selector: 'app-group-node',
  templateUrl: 'group-node.component.html',
  styleUrls: ['group-node.component.scss'],
})
export class GroupNodeComponent {
  data: RowData[] = [];

  add() {
    this.data.push({
      id: v4(),
      name: '',
      nodeCount: 0,
      editable: false,
    });
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  remove(item: RowData) {
    this.data = this.data.filter((e) => e.id !== item.id);
  }

  update(item: RowData) {
    item.editable = false;
  }
}
