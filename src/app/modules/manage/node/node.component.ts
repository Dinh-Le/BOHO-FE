import { Component, OnInit } from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowData,
} from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { v4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import { NodeService } from 'src/app/data/service/node.service';
import { ToastService } from '@app/services/toast.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Node } from 'src/app/data/schema/boho-v2/node';

interface NodeRowData extends ExpandableTableRowData {
  id: string;
  name?: string;
  groupName?: string;
  typeName?: string;
  host?: string;
  port?: string;
  status?: boolean;
  form: FormGroup<any>;
  editable: boolean;
  newNode?: boolean;
}

@Component({
  selector: 'app-node',
  templateUrl: 'node.component.html',
  styleUrls: ['node.component.scss'],
})
export class NodeComponent implements OnInit {
  nodeOperatorId: string;
  data: NodeRowData[] = [];
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
  types: SelectItemModel[] = ['TensorRT', 'DeepStream'].map((e) => ({
    value: e,
    label: e,
  }));

  constructor(
    activatedRoute: ActivatedRoute,
    private nodeService: NodeService,
    private toastService: ToastService
  ) {
    this.nodeOperatorId = activatedRoute.snapshot.params['nodeOperatorId'];
  }

  ngOnInit(): void {
    this.nodeService.findAll('0').subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Fetch node data failed.');
        return;
      }

      console.log(response.data);
      this.data = response.data
        .filter((e) => e.node_operator_id === this.nodeOperatorId)
        .map((e) => ({
          id: e.id,
          name: e.name,
          groupName: '',
          typeName: e.type,
          host: e.ip?.split(':')[0],
          port: e.ip?.split(':')[1],
          status: e.is_active,
          editable: false,
          form: new FormGroup({
            name: new FormControl(e.name, [Validators.required]),
            type: new FormControl(
              e.type
                ? {
                    label: e.type,
                    value: e.type,
                  }
                : null,
              [Validators.required]
            ),
            host: new FormControl(e.ip.split(':')[0], [Validators.required]),
            port: new FormControl(e.ip.split(':')[1], [
              Validators.required,
              Validators.min(1),
              Validators.max(65535),
            ]),
            userId: new FormControl(e.node_metadata.user, [
              Validators.required,
            ]),
            password: new FormControl(null, [Validators.required]),
          }),
        }));
    });
  }

  add() {
    this.data.push({
      id: v4(),
      isExpanded: true,
      editable: true,
      newNode: true,
      form: new FormGroup({
        name: new FormControl(null, [Validators.required]),
        type: new FormControl(null, [Validators.required]),
        host: new FormControl(null, [Validators.required]),
        port: new FormControl(null, [Validators.required]),
        userId: new FormControl(null, [Validators.required]),
        password: new FormControl(null, [Validators.required]),
      }),
    });
  }

  save(data: NodeRowData) {
    const node: Node = {
      id: data.id,
      node_operator_id: this.nodeOperatorId,
      location: {
        lat: '',
        long: '',
      },
      name: data.form.get('name')!.value,
      type: (data.form.get('type')!.value as SelectItemModel).value,
      ip: `${data.form.get('host')!.value}:${data.form.get('port')!.value}`,
      is_active: false,
      node_metadata: {
        user: data.form.get('userId')!.value,
        password: data.form.get('password')!.value,
      },
    };

    const response$ = data.newNode
      ? this.nodeService.create('0', node)
      : this.nodeService.update('0', node);
    response$.subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Create new node failed');
        return;
      }

      data.name = node.name;
      data.typeName = node.type;
      data.host = node.ip;
      data.port = data.form.get('port')?.value;
      data.editable = false;
      data.newNode = false;
    });
  }

  remove(data: NodeRowData) {
    console.log('REmove');
    this.nodeService.delete('0', data.id).subscribe((response) => {
      if (!response.success) {
        this.toastService.showError('Delete node failed');
        return;
      }

      this.data = this.data.filter((e) => e.id !== data.id);
    });
  }
}
