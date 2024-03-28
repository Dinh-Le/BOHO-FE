import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import {
  ColumnConfig,
  ExpandableTableRowItemModelBase,
} from '../expandable-table/expandable-table.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { v4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import { NodeService } from 'src/app/data/service/node.service';
import { ToastService } from '@app/services/toast.service';
import { Node } from 'src/app/data/schema/boho-v2/node';
import { Subscription, switchMap } from 'rxjs';
import { NodeTypes } from 'src/app/data/constants';
import {
  NavigationService,
  SideMenuItemType,
} from 'src/app/data/service/navigation.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

class RowItemModel extends ExpandableTableRowItemModelBase {
  id: string = v4();
  status: boolean = false;
  nodeOperatorId: string = '';
  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    type: new FormControl<SelectItemModel | null | undefined>(null, [
      Validators.required,
    ]),
    host: new FormControl<string>('', [Validators.required]),
    port: new FormControl<number>(80, [Validators.required]),
    userId: new FormControl<string>(''),
    password: new FormControl<string>(''),
  });

  get name() {
    return this.form.value.name ?? '';
  }

  set name(value: string) {
    this.form.get('name')?.setValue(value);
  }

  get type() {
    return this.form.value.type;
  }

  get host() {
    return this.form.value.host;
  }

  get port() {
    return this.form.value.port;
  }

  get userId() {
    return this.form.value.userId;
  }

  get password() {
    return this.form.value.password;
  }

  get canSubmit() {
    return this.form.valid;
  }

  get data(): Node {
    return {
      id: this.id,
      name: this.name!,
      ip: this.host!,
      is_activate: true,
      port: this.port!,
      node_operator_id: this.nodeOperatorId,
      type: this.type?.value!,
      node_metadata: {
        user: this.userId!,
        password: this.password!,
      },
    };
  }

  set data(node: Node) {
    this.id = node.id;
    this.status = node.status ?? false;
    this.nodeOperatorId = node.node_operator_id;
    this.form.reset({
      name: node.name,
      host: node.ip,
      port: node.port,
      userId: node.node_metadata.user,
      password: node.node_metadata.password,
      type: {
        value: node.type,
        label: node.type,
      },
    });
  }
}

@Component({
  selector: 'app-node',
  templateUrl: 'node.component.html',
  styleUrls: ['node.component.scss', '../shared/my-input.scss'],
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class') classNames = 'flex-grow-1 d-flex flex-column';

  private _activatedRoute = inject(ActivatedRoute);
  private _nodeService = inject(NodeService);
  private _toastService = inject(ToastService);
  private _navigationService = inject(NavigationService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('statusTemplate') statusTemplateRef!: TemplateRef<any>;

  data: RowItemModel[] = [];
  columns: ColumnConfig[] = [];
  types: SelectItemModel[] = NodeTypes.map((e) => ({
    value: e,
    label: e,
  }));
  _nodeOperatorId = '';
  private _subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const activatedRouteSubscription = this._activatedRoute.params
      .pipe(
        switchMap(({ nodeOperatorId }) => {
          this._nodeOperatorId = nodeOperatorId;
          return this._nodeService.findAll(this._nodeOperatorId);
        })
      )
      .subscribe({
        next: ({ data: nodes }) => {
          this.data = nodes.map((node) => {
            const item = new RowItemModel();
            item.data = node;
            return item;
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(err.error?.message ?? err.message),
      });
    this._subscriptions.push(activatedRouteSubscription);
  }

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên node',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Loại',
        prop: 'type.label',
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
        width: '150px',
        contentTemplateRef: this.statusTemplateRef,
      },
    ];
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  add() {
    const item = new RowItemModel();
    const index =
      this.data.filter((e) => /Analytic node \d+/.test(e.name)).length + 1;
    item.name = `Analytic node ${index}`;
    item.isEditable = true;
    item.isNew = true;
    item.isExpanded = true;
    item.nodeOperatorId = this._nodeOperatorId;
    this.data.push(item);
  }

  edit(item: RowItemModel) {
    item.form.enable();
    item.isEditable = true;
  }

  submit(item: RowItemModel) {
    const data = Object.assign({}, item.data, {
      id: undefined,
      is_active: undefined,
    });
    if (item.isNew) {
      this._nodeService
        .create(data)

        .subscribe({
          next: ({ data: id }) => {
            this._toastService.showSuccess('Create node successfully');
            item.isNew = false;
            item.isEditable = false;
            item.form.disable();
            item.id = id;
            this._navigationService.treeItemChange$.next({
              type: SideMenuItemType.NODE,
              action: 'create',
              data: Object.assign({}, data, {
                id,
              }),
            });
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(
              `Create node failed with error: ${
                err.error?.message ?? err.message
              }`
            ),
        });
    } else {
      this._nodeService.update(item.id, data).subscribe({
        complete: () => {
          this._toastService.showSuccess('Update node successfully');
          item.isEditable = false;
          item.form.disable();
          this._navigationService.treeItemChange$.next({
            type: SideMenuItemType.NODE,
            action: 'update',
            data: Object.assign({}, data, {
              id: item.id,
            }),
          });
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Update node failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
    }
  }

  cancel(item: RowItemModel) {
    if (item.isNew) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    item.isEditable = false;
    item.form.disable();
  }

  remove({ id }: RowItemModel) {
    this._nodeService.delete(id).subscribe({
      complete: () => {
        this._toastService.showSuccess('Delete node successfully');
        this.data = this.data.filter((e) => e.id !== id);
        this._navigationService.treeItemChange$.next({
          type: SideMenuItemType.NODE,
          action: 'delete',
          data: {
            id,
          },
        });
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(
          `Delete node failed with error: ${err.error?.message ?? err.message}`
        ),
    });
  }
}
