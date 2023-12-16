import { Component, OnInit, inject } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { v4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import {
  CreateOrUpdateNodeDto,
  NodeService,
} from 'src/app/data/service/node.service';
import { ToastService } from '@app/services/toast.service';
import { NodeOperatorService } from 'src/app/data/service/node-operator.service';
import { NodeOperator } from 'src/app/data/schema/boho-v2/node-operator';
import { Node } from 'src/app/data/schema/boho-v2/node';
import { catchError, of, switchMap } from 'rxjs';
import { NodeTypes } from 'src/app/data/constants';
import {
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';

interface RowItemModel extends ExpandableTableRowData {
  id: string;
  name: string;
  group: string;
  type: SelectItemModel;
  host: string;
  port: number;
  userId: string;
  password: string;
  status?: boolean;
  isEditable?: boolean;
  isNewNode?: boolean;
}

@Component({
  selector: 'app-node',
  templateUrl: 'node.component.html',
  styleUrls: ['node.component.scss', '../shared/my-input.scss'],
})
export class NodeComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _nodeOperatorService = inject(NodeOperatorService);
  private _nodeService = inject(NodeService);
  private _toastService = inject(ToastService);
  private _navigationService = inject(NavigationService);

  _nodeOperator: NodeOperator | undefined;
  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [
    {
      label: 'Tên nút',
      prop: 'name',
      sortable: true,
    },
    {
      label: 'Loại',
      prop: 'typeName',
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
  types: SelectItemModel[] = NodeTypes.map((e) => ({
    value: e,
    label: e,
  }));

  ngOnInit(): void {
    this._activatedRoute.params
      .pipe(
        switchMap((params) =>
          this._nodeOperatorService.find(params['nodeOperatorId'])
        ),
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              'Fetch group node data failed with error: ' + response.message
            );
          }

          this._nodeOperator = response.data;
          return this._nodeService.findAll(this._nodeOperator.id);
        }),
        catchError((error) => {
          this._toastService.showError(error);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response?.success) {
          this.data = response.data.map((e) => ({
            id: e.id,
            name: e.name,
            group: this._nodeOperator!.name,
            type: {
              label: e.type,
              value: e.type,
            },
            host: e.ip,
            port: e.port,
            userId: e.node_metadata.user,
            password: e.node_metadata.password,
            status: e.is_active,
            isEditable: false,
          }));
        }
      });
  }

  add() {
    this.data.push({
      id: v4(),
      name: '',
      group: this._nodeOperator!.name,
      type: this.types[0],
      host: '',
      port: 80,
      userId: '',
      password: '',
      isExpanded: true,
      isEditable: true,
      isNewNode: true,
    });
  }

  save(data: RowItemModel) {
    const node: CreateOrUpdateNodeDto = {
      node_operator_id: this._nodeOperator!.id,
      name: data.name,
      type: data.type.value,
      ip: data.host,
      port: data.port,
      node_metadata: {
        user: data.userId,
        password: data.password,
      },
    };

    if (data.isNewNode) {
      this._nodeService
        .create(node)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(`Create node failed with error: ${response.message}`);
            }

            return of(response);
          })
        )
        .subscribe({
          next: (response) => {
            this._toastService.showSuccess('Create node successfully');
            data.isNewNode = false;
            data.id = (response as { data: string }).data;
            data.isEditable = false;
            this._navigationService.treeItemChange$.next({
              type: SideMenuItemType.NODE,
              action: 'create',
              data: Object.assign({}, node, {
                id: data.id,
              }),
            });
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } else {
      this._nodeService
        .update(data.id, node)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(`Update node failed with error: ${response.message}`);
            }

            return of(response);
          })
        )
        .subscribe({
          next: () => {
            this._toastService.showSuccess('Update node successfully');
            data.isEditable = false;
            this._navigationService.treeItemChange$.next({
              type: SideMenuItemType.NODE,
              action: 'update',
              data: Object.assign({}, node, {
                id: data.id,
              }),
            });
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    }
  }

  cancel(item: RowItemModel) {
    if (item.isNewNode) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    item.isEditable = false;
  }

  remove({ id }: RowItemModel) {
    this._nodeService
      .delete(id)
      .pipe(
        catchError(({ message }) =>
          of({
            success: false,
            message,
          })
        )
      )
      .subscribe((response) => {
        if (!response.success) {
          this._toastService.showError(
            'Delete node failed. Reason: ' + response.message
          );
          return;
        }

        this.data = this.data.filter((e) => e.id !== id);
        this._navigationService.treeItemChange$.next({
          type: SideMenuItemType.NODE,
          action: 'delete',
          data: {
            id,
          },
        });
      });
  }
}
