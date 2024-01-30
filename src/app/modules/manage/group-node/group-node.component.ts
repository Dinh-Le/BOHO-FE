import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddGroupNodeComponent } from './add-group-node/add-group-node.component';
import {
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  private _navigationService = inject(NavigationService);
  private _toastService = inject(ToastService);
  modalService = inject(NgbModal);
  nodeOperatorService = inject(NodeOperatorService);
  data: RowData[] = [];

  ngOnInit(): void {
    this.nodeOperatorService.findAll().subscribe({
      next: ({ data: nodeOperators }) => {
        this.data = nodeOperators.map((e) => ({
          id: e.id,
          name: e.name,
          nodeCount: e.node_count ?? 0,
        }));
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });
  }

  async add() {
    try {
      const { name } = await this.modalService.open(AddGroupNodeComponent)
        .result;

      this.nodeOperatorService.create({ name }).subscribe({
        next: ({ data: nodeOperatorId }) => {
          this._toastService.showSuccess('Create node operator successfully');
          this.data.push({
            id: nodeOperatorId,
            name,
            nodeCount: 0,
            editable: false,
          });
          this._navigationService.treeItemChange$.next({
            type: SideMenuItemType.NODE_OPERATOR,
            action: 'create',
            data: {
              id: nodeOperatorId,
              name,
            },
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    } catch {
      // Do nothing
    }
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  remove(item: RowData) {
    this.nodeOperatorService.delete(item.id).subscribe({
      complete: () => {
        this._toastService.showSuccess('Delete node operator successfully');
        this.data = this.data.filter((e) => e.id !== item.id);
        this._navigationService.treeItemChange$.next({
          type: SideMenuItemType.NODE_OPERATOR,
          action: 'delete',
          data: {
            id: item.id,
          },
        });
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(err.error?.message ?? err.message),
    });
  }

  update(item: RowData) {
    this.nodeOperatorService
      .update({
        id: item.id,
        name: item.name,
      })
      .subscribe({
        next: () => {
          this._toastService.showSuccess('Update node operator successfully');
          item.editable = false;
          this._navigationService.treeItemChange$.next({
            type: SideMenuItemType.NODE_OPERATOR,
            action: 'update',
            data: {
              id: item.id,
              name: item.name,
            },
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
  }
}
