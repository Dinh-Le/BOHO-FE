import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NodeOperator } from 'src/app/data/schema/boho-v2/node-operator';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { v4 } from 'uuid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddGroupNodeComponent } from './add-group-node/add-group-node.component';

interface RowData {
  id: string;
  name: string;
  nodeCount: number;
  editable?: boolean;
}

@Component({
  selector: 'app-group-node',
  templateUrl: 'group-node.component.html',
  styleUrls: ['group-node.component.scss', '../shared/table.scss'],
})
export class GroupNodeComponent implements OnInit {
  modalService = inject(NgbModal);
  nodeOperatorService = inject(NodeOperatorService);
  toastService = inject(ToastService);
  data: RowData[] = [];

  ngOnInit(): void {
    this.nodeOperatorService.findAll('0').subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Fetch node operator failed');
        return;
      }

      this.data = response.data.map((e) => ({
        id: e.id,
        name: e.name,
        nodeCount: 0,
      }));
    });
  }

  async add() {
    try {
      const { name } = await this.modalService.open(AddGroupNodeComponent)
        .result;

      const newNodeOperator: NodeOperator = {
        id: v4(),
        name,
        describle: '',
      };
      this.nodeOperatorService
        .create('0', newNodeOperator)
        .subscribe((response) => {
          if (!response.success) {
            this.toastService.showError('Create new node operator failed');
            return;
          }

          this.data.push({
            id: newNodeOperator.id,
            name: newNodeOperator.name,
            nodeCount: 0,
            editable: false,
          });
        });
    } catch {
      // Do nothing
    }
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  remove(item: RowData) {
    this.nodeOperatorService.delete('0', item.id).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Delete node operator failed');
        return;
      }

      this.data = this.data.filter((e) => e.id !== item.id);
    });
  }

  update(item: RowData) {
    this.nodeOperatorService
      .update('0', {
        id: item.id,
        name: item.name,
        describle: '',
        node_id: '',
      })
      .subscribe((response) => {
        if (!response.success) {
          this.toastService.showError('Update node operator failed');
          return;
        }

        item.editable = false;
      });
  }
}
