import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NodeOperator } from 'src/app/data/schema/boho-v2/node-operator';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { v4 } from 'uuid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddGroupNodeComponent } from './add-group-node/add-group-node.component';
import {
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';
import { of, switchMap } from 'rxjs';

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
    this.nodeOperatorService.findAll().subscribe((response) => {
      if (!response.success) {
        this._toastService.showError('Fetch node operator failed');
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
      };
      this.nodeOperatorService
        .create(newNodeOperator)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Create node operator failed with error: ${response.message}`
              );
            }

            return of(response);
          })
        )
        .subscribe({
          next: (response) => {
            this._toastService.showSuccess('Create node operator successfully');
            this.data.push({
              id: response.data,
              name: newNodeOperator.name,
              nodeCount: 0,
              editable: false,
            });
            this._navigationService.treeItemChange$.next({
              type: SideMenuItemType.NODE_OPERATOR,
              action: 'create',
              data: {
                id: response.data,
                name: newNodeOperator.name,
              },
            });
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } catch {
      // Do nothing
    }
  }

  trackById(_: any, item: RowData) {
    return item.id;
  }

  remove(item: RowData) {
    this.nodeOperatorService
      .delete(item.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Delete node operator failed with error: ${response.message}`
            );
          }

          return of(response);
        })
      )
      .subscribe(() => {
        this._toastService.showSuccess('Delete node operator successfully');
        this.data = this.data.filter((e) => e.id !== item.id);
        this._navigationService.treeItemChange$.next({
          type: SideMenuItemType.NODE_OPERATOR,
          action: 'delete',
          data: {
            id: item.id,
          },
        });
      });
  }

  update(item: RowData) {
    this.nodeOperatorService
      .update({
        id: item.id,
        name: item.name,
      })
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Update node operator failed with error: ${response.message}`
            );
          }

          return of(response);
        })
      )
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
        error: ({ message }) => this._toastService.showError(message),
      });
  }
}
