import { Component, OnInit, Optional } from "@angular/core";
import { ColumnConfig, ExpandableTableRowData } from "../expandable-table/expandable-table.component";
import { SelectItemModel } from "@shared/models/select-item-model";
import { v4 } from "uuid";

interface NodeRowData extends ExpandableTableRowData {
    id: string;
    name?: string;
    groupName?: string;
    typeName?: string;
    host?: string;
    port?: number;
    status?: boolean;
    formData: NodeFormData;
}

interface NodeFormData {
    name?: string;
    type?: SelectItemModel;
    host?: string;
    port?: number;
    userId?: string;
    password?: string;
    editable: boolean;
}

@Component({
    selector: 'app-node',
    templateUrl: 'node.component.html',
    styleUrls: ['node.component.scss']
})
export class NodeComponent implements OnInit {
    data: NodeRowData[] = [];
    columns: ColumnConfig[] = [
        {
            label: 'Tên nút',
            prop: 'name',
            sortable: true
        },
        {
            label: 'Loại',
            prop: 'typeName',
            sortable: true
        },
        {
            label: 'Host',
            prop: 'host',
            sortable: true
        },
        {
            label: 'Cổng',
            prop: 'port',
            sortable: true
        },
        {
            label: 'Trạng thái',
            prop: 'status',
            sortable: true
        },
    ];
    types: SelectItemModel[] = [
        {
            value: 'tensor-rt',
            label: 'TensorRT'
        },
        {
            value: 'deepstream',
            label: 'DeepStream'
        }
    ];

    ngOnInit(): void {
        
    }

    add() {
        this.data.push({
            id: v4(),
            formData: {
                editable: true
            },
            isExpanded: true
        })
    }

    save(data: NodeRowData) {
        data.name = data.formData.name;
        data.typeName = data.formData.type?.label;
        data.host = data.formData.host;
        data.port = data.formData.port;
        data.formData.editable = false;
    }

    remove(data: NodeRowData) {
        this.data = this.data.filter(e => e.id !== data.id);
    }
}