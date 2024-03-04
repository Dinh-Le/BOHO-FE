import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import {
  ColumnConfig,
  ExpandableTableRowItemModelBase,
} from '../expandable-table/expandable-table.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Milestone } from 'src/app/data/schema/boho-v2/milestone';
import { MilestoneService } from 'src/app/data/service/milestone.service';
import { ToastService } from '@app/services/toast.service';
import { EMPTY, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Level2Menu, Level3Menu, NavigationService } from 'src/app/data/service/navigation.service';

class RowItemModel extends ExpandableTableRowItemModelBase {
  static counter: number = 1;
  private _id: number;
  private _form: FormGroup<any>;

  constructor() {
    super();

    this._id = RowItemModel.counter;
    RowItemModel.counter += 1;

    this._form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      host: new FormControl('', [Validators.required]),
      port: new FormControl(8080, [Validators.required]),
      authenType: new FormControl<SelectItemModel>(
        {
          value: 'Basic',
          label: 'Basic',
        } as SelectItemModel,
        [Validators.required]
      ),
      userId: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      eventPort: new FormControl(8080, [Validators.required]),
    });
  }

  get id() {
    return this._id;
  }

  get form() {
    return this._form;
  }

  get name() {
    return this._form.get('name')?.value;
  }

  set name(value: string) {
    this._form.get('name')?.setValue(value);
  }

  get host() {
    return this._form.get('host')?.value;
  }

  get port() {
    return this._form.get('port')?.value;
  }

  get authenType() {
    return this._form.get('authenType')?.value;
  }

  get userId() {
    return this._form.get('userId')?.value;
  }

  get password() {
    return this._form.get('password')?.value;
  }

  get eventPort() {
    return this._form.get('eventPort')?.value;
  }

  get canSubmit() {
    return this._form.valid;
  }

  set data(value: Milestone) {
    this._id = value.id;
    this._form.reset(
      {
        name: value.name,
        host: value.login_info.host,
        port: value.login_info.port,
        authenType: {
          value: value.authen_type,
          label: value.authen_type,
        },
        userId: value.login_info.user,
        password: value.login_info.password,
        eventPort: value.communication_port,
      },
      {
        emitEvent: true,
      }
    );
  }

  get data(): Milestone {
    const { name, host, port, authenType, userId, password, eventPort } =
      this._form.value;
    return {
      id: this.isNew ? 0 : this._id,
      name,
      login_info: {
        host,
        port,
        user: userId,
        password,
      },
      authen_type: authenType.value,
      communication_port: eventPort,
    };
  }

  get type() {
    return 'Milestone';
  }
}

@Component({
  selector: 'app-system',
  templateUrl: 'system.component.html',
  styleUrls: ['system.component.scss', './../shared/my-input.scss'],
})
export class SystemComponent implements AfterViewInit, OnInit {
  @HostBinding('class') classNames = 'flex-grow-1 d-flex flex-column';
  private _milestoneSevice = inject(MilestoneService);
  private _toastService = inject(ToastService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _navigationService = inject(NavigationService);

  @ViewChild('statusCellTemplateRef') statusCellTemplateRef!: TemplateRef<any>;

  systems: SelectItemModel[] = [
    {
      value: 'license-manager',
      label: 'Bản quyền',
      selected: false,
    },
    {
      value: 'milestone-vms',
      label: 'Milestone VMS',
      selected: true,
    },
    // {
    //   value: 'smtp-mail',
    //   label: 'SMTP mail',
    // },
  ];
  selectedSystem: SelectItemModel = this.systems[0];
  columns: ColumnConfig[] = [];
  data: RowItemModel[] = [];
  authenTypes: SelectItemModel[] = ['Windows', 'Basic'].map((at) => ({
    value: at,
    label: at,
  }));

  ngOnInit(): void {
    this._milestoneSevice.findAll().subscribe({
      next: ({ data: milestones }) => {
        this.data = milestones.map((ms) => {
          const item = new RowItemModel();
          item.data = ms;
          return item;
        });
      },
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(
          `Create milestone failed with error: ${
            err.error?.message ?? err.message
          }`
        ),
    });
  }

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên giao tiếp',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Loại',
        prop: 'type',
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
        width: '200',
        contentTemplateRef: this.statusCellTemplateRef,
      },
    ];
    this._changeDetectorRef.detectChanges();
  }

  onMenuItemClick(_: SelectItemModel) {
    this._navigationService.level2 = Level2Menu.SYSTEM;
    this._navigationService.level3 = Level3Menu.LICENSE_MANAGER;
    this._navigationService.navigate();
  }

  add() {
    const row = new RowItemModel();
    const index =
      this.data.filter((e) => /Milestone VMS server \d+/.test(e.name)).length +
      1;
    row.name = `Milestone VMS server ${index}`;
    row.isEditable = true;
    row.isExpanded = true;
    row.isNew = true;
    this.data.push(row);
  }

  submit(item: RowItemModel) {
    const milestone = item.data;

    if (item.isNew) {
      this._milestoneSevice
        .create(
          Object.assign({}, milestone, {
            id: undefined,
          })
        )
        .subscribe({
          next: ({ data: id }) => {
            this._toastService.showSuccess('Create new Milestone sucessfully');
            milestone.id = id;
            item.data = milestone;
            item.isEditable = false;
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(
              `Create milestone failed with error: ${
                err.error?.message ?? err.message
              }`
            ),
        });
    } else {
      this._milestoneSevice
        .update(
          milestone.id,
          Object.assign({}, milestone, {
            id: undefined,
          })
        )
        .subscribe({
          next: () => {
            this._toastService.showSuccess('Update Milestone info sucessfully');
            item.data = milestone;
            item.isEditable = false;
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(
              `Create milestone failed with error: ${
                err.error?.message ?? err.message
              }`
            ),
        });
    }
  }

  cancel(item: RowItemModel) {
    if (!item.isNew) {
      this._milestoneSevice.find(item.id).subscribe({
        next: (response) => {
          if (!response.success) {
            throw Error('Reset data failed with error: ' + response.message);
          }

          item.data = response.data;
          item.isEditable = false;
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Test sending to the ${item.name} failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
    } else {
      this.data = this.data.filter(({ id }) => item.id !== id);
    }
  }

  remove(item: RowItemModel) {
    this._milestoneSevice.delete(item.id).subscribe({
      next: (response) =>
        (this.data = this.data.filter(({ id }) => item.id !== id)),
      error: (err: HttpErrorResponse) =>
        this._toastService.showError(
          `Test sending to the ${item.name} failed with error: ${
            err.error?.message ?? err.message
          }`
        ),
    });
  }

  verify(item: RowItemModel) {
    this._milestoneSevice
      .verify(item.data)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw new Error(response.message);
          }

          return EMPTY;
        })
      )
      .subscribe({
        complete: () =>
          this._toastService.showSuccess(
            `Test sending to the ${item.name} successfully`
          ),
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Test sending to the ${item.name} failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }

  connect(item: RowItemModel) {
    this._milestoneSevice
      .connect(item.data)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw new Error(response.message);
          }

          return EMPTY;
        })
      )
      .subscribe({
        complete: () =>
          this._toastService.showSuccess(
            `Test connection to the ${item.name} successfully`
          ),
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Test connection to the ${item.name} failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }
}
