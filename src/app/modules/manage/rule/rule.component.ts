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
import { ColumnConfig } from '../expandable-table/expandable-table.component';
import { ActivatedRoute } from '@angular/router';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { ScheduleService } from 'src/app/data/service/schedule.service';
import {
  EMPTY,
  Subscription,
  catchError,
  filter,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import {
  InvalidId,
  Objects,
  RuleTypeItemsSource,
  Severities,
  Severity,
} from 'src/app/data/constants';
import { RuleService } from 'src/app/data/service/rule.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NodeService } from 'src/app/data/service/node.service';
import { Schedule } from 'src/app/data/schema/boho-v2/shedule';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { RuleItemModel } from './models';
import {
  Device,
  ObjectModel,
  RuleTypeModel,
} from 'src/app/data/schema/boho-v2';
import { CameraType } from 'src/app/data/data.types';
import { Rule } from 'src/app/data/schema/boho-v2/rule';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss', '../shared/my-input.scss'],
})
export class RuleComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class')
  classNames = 'flex-grow-1 d-flex flex-column';

  @ViewChild('objectColumnTemplate', { static: true })
  objectColumnTemplate!: TemplateRef<any>;

  cameraId = '';
  nodeId = '';

  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _scheduleService = inject(ScheduleService);
  private _toastService = inject(ToastService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _ruleService = inject(RuleService);
  private _nodeService = inject(NodeService);

  data: RuleItemModel[] = [];
  presets: Record<number, Preset> = {};

  private get _cameraType(): CameraType {
    return (this._navigationService.sideMenu.data as Device).camera.type;
  }

  get ruleTypes(): RuleTypeModel[] {
    return RuleTypeItemsSource.filter((rule) =>
      rule.cameraTypes.includes(this._cameraType as any)
    );
  }

  get objects(): ObjectModel[] {
    return Objects;
  }

  get severities(): Severity[] {
    return Severities;
  }

  schedules: Schedule[] = [];
  columns: ColumnConfig[] = [];
  private _subscriptions: Subscription[] = [];

  constructor() {
    this._navigationService.level3 = Level3Menu.RULE;
    this._activatedRoute.params
      .pipe(
        filter(({ nodeId, cameraId }) => nodeId && cameraId),
        tap(() => {
          this.data = [];
          this.presets = {};
          this.schedules = [];
        }),
        switchMap(({ nodeId, cameraId }) => {
          this.cameraId = cameraId;
          this.nodeId = nodeId;

          return this._presetService
            .findAll(this.nodeId, this.cameraId)
            .pipe(
              catchError(
                this.showHttpErrorAndRethrow.bind(
                  this,
                  'Lỗi lấy danh sách các điểm preset'
                )
              )
            );
        }),
        switchMap(({ data }) => {
          this.presets = data.reduce(
            (dict, item) => Object.assign(dict, { [item.id]: item }),
            {} as Record<number, Preset>
          );

          return this._scheduleService
            .findAll(this.nodeId, this.cameraId)
            .pipe(
              catchError(
                this.showHttpErrorAndRethrow.bind(
                  this,
                  'Lỗi lấy danh sách các lịch trình'
                )
              )
            );
        }),
        switchMap(({ data }) => {
          this.schedules = data;

          return this._ruleService
            .findAll(this.nodeId, this.cameraId)
            .pipe(
              catchError(
                this.showHttpErrorAndRethrow.bind(
                  this,
                  'Lỗi lấy danh sách các quy tắc'
                )
              )
            );
        }),
        tap(({ data: rules }) => {
          this.data = rules.map((rule) => {
            const item = new RuleItemModel();
            item.setData(rule, this.schedules, this.presets[rule.preset_id]);
            return item;
          });
        })
      )
      .subscribe({
        error: (error) => console.error(error),
      });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.columns = [
      {
        label: 'Tên quy tắc',
        prop: 'name',
        sortable: true,
      },
      {
        label: 'Điểm giám sát',
        prop: 'preset.name',
        sortable: true,
      },
      {
        label: 'Loại quy tắc',
        prop: 'type.name',
        sortable: true,
      },
      {
        label: 'Loại đối tượng',
        prop: 'objects',
        sortable: true,
        contentTemplateRef: this.objectColumnTemplate,
      },
      {
        label: 'Lịch trình',
        prop: 'schedule.name',
        sortable: true,
      },
    ];
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((e) => e.unsubscribe());
  }

  private showHttpErrorAndRethrow(message: string, error: HttpErrorResponse) {
    this._toastService.showHttpError(error, message);

    return throwError(() => error);
  }

  add(): void {
    const newItem = new RuleItemModel();
    const index =
      this.data.filter((it) => /Quy tắc mới \d\d\d/.test(it.name ?? ''))
        .length + 1;
    newItem.form.controls.name.setValue(
      `Quy tắc mới ${index.toString().padStart(3, '0')}`
    );
    newItem.isEditable = true;
    newItem.isExpanded = true;
    newItem.form.enable();
    this.data.push(newItem);
  }

  submit(item: RuleItemModel) {
    if (item.id === +InvalidId) {
      this._ruleService
        .create(this.nodeId, this.cameraId, item.data)
        .pipe(
          tap(({ data: id }) => {
            item.id = id;
            item.isEditable = false;
            item.form.disable();
          }),
          switchMap(() =>
            this._nodeService.ruleUpdate(this.nodeId).pipe(
              catchError((error: HttpErrorResponse) => {
                console.error(error);

                this._toastService.showWarning(
                  'Lỗi đồng bộ các quy tắc đến Node service'
                );

                return EMPTY;
              })
            )
          )
        )
        .subscribe({
          complete: () => {
            this._toastService.showSuccess('Tạo quy tắc thành công');
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(err.error?.message ?? err.message),
        });
    } else {
      this._ruleService
        .update(this.nodeId, this.cameraId, item.id, item.data)
        .pipe(
          switchMap(() =>
            this._nodeService.ruleUpdate(this.nodeId).pipe(
              catchError((error: HttpErrorResponse) => {
                console.error(error);

                this._toastService.showWarning(
                  'Lỗi đồng bộ các quy tắc đến Node service'
                );

                return EMPTY;
              })
            )
          )
        )
        .subscribe({
          complete: () => {
            this._toastService.showSuccess('Cập nhật quy tắc thành công');
            item.isEditable = false;
            item.form.disable({
              emitEvent: false,
            });
          },
          error: (err: HttpErrorResponse) =>
            this._toastService.showError(
              'Lỗi cập nhật: ' + err.error?.message ?? err.message
            ),
        });
    }
  }

  edit(item: RuleItemModel) {
    item.isEditable = true;
    item.form.enable({ emitEvent: false });
  }

  cancel(item: RuleItemModel) {
    if (item.id === +InvalidId) {
      this.data = this.data.filter((e) => e.id !== item.id);
      return;
    }

    this._ruleService.find(this.nodeId, this.cameraId, item.id).subscribe({
      next: ({ data }) => {
        item.setData(data, this.schedules, this.presets[data.preset_id]);
      },
      error: (err: HttpErrorResponse) => {
        this._toastService.showError(err.error.message ?? err.message);
      },
      complete: () => {
        item.isEditable = false;
        item.form.disable({ emitEvent: false });
      },
    });
  }

  remove(item: RuleItemModel) {
    const deleteItem$ =
      item.id === +InvalidId
        ? EMPTY
        : this._ruleService.delete(this.nodeId, this.cameraId, item.id).pipe(
            switchMap(() =>
              this._nodeService.ruleUpdate(this.nodeId).pipe(
                catchError((error: HttpErrorResponse) => {
                  console.error(error);

                  this._toastService.showWarning(
                    'Lỗi đồng bộ các quy tắc đến Node service'
                  );

                  return EMPTY;
                })
              )
            )
          );

    deleteItem$.subscribe({
      complete: () => {
        this.data = this.data.filter((e) => e.id !== item.id);
        this._toastService.showSuccess('Xóa quy tắc thành công');
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);

        this._toastService.showHttpError(err, 'Lỗi xóa quy tắc');
      },
    });
  }

  trackById(_: any, { id }: any): any {
    return id;
  }

  trackByValue(_: any, { value }: any): any {
    return value;
  }

  toggleDirection(data: RuleItemModel) {
    switch (data.form.controls.direction.value) {
      case 'left to right':
        data.form.controls.direction.setValue('right to left');
        break;
      case 'right to left':
        data.form.controls.direction.setValue('left to right');
        break;
      default:
        data.form.controls.direction.setValue('left to right');
        break;
    }
  }
}
