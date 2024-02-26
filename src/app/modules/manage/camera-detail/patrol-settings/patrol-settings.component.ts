import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { ActivatedRoute } from '@angular/router';
import { PatrolService } from 'src/app/data/service/patrol.service';
import {
  EMPTY,
  Subscription,
  concat,
  delay,
  filter,
  finalize,
  of,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { PresetSelectDialogComponent } from './preset-select-dialog/preset-select-dialog.component';
import {
  CreatePatrolManagementDto,
  PatrolManagementService,
} from 'src/app/data/service/patrol-management.service';
import { PatrolManagement } from 'src/app/data/schema/boho-v2/patrol-management';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { DeviceService } from 'src/app/data/service/device.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';

type PatrolManagementRowItem = PatrolManagement &
  Partial<{
    presetName: string;
    isNew: boolean;
    isRunning?: boolean;
  }>;

@Component({
  selector: 'app-patrol-settings',
  templateUrl: 'patrol-settings.component.html',
  styleUrls: ['patrol-settings.component.scss', '../../shared/my-input.scss'],
  host: {
    class: 'flex-grow-1 d-flex flex-column my-bg-default px-5 pb-5 pt-1',
  },
})
export class PatrolSettingsComponent implements OnInit, OnDestroy {
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _patrolService = inject(PatrolService);
  private _patrolManagementService = inject(PatrolManagementService);
  private _presetService = inject(PresetService);
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _deviceService = inject(DeviceService);
  private _nodeId: string = '';
  private _deviceId: string = '';

  selectedPatrol?: SelectItemModel;
  activeModal?: NgbModalRef;
  patrols: SelectItemModel[] = [];
  presetList: Preset[] = [];
  patrolManagementList: PatrolManagementRowItem[] = [];
  private _activatedRouteSubscription: Subscription | undefined;
  loading: boolean = false;

  patrolForm = new FormGroup({
    id: new FormControl<number>(0, [Validators.required]),
    name: new FormControl<string>('', [Validators.required]),
  });

  private initialize({ nodeId, deviceId }: any) {
    this._nodeId = nodeId;
    this._deviceId = deviceId;
    this.patrols = [];
  }

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.PATROL_SETTINGS;
    this._activatedRouteSubscription = this._activatedRoute.parent?.params
      .pipe(filter(({ nodeId, cameraId }) => nodeId && cameraId))
      .subscribe(({ nodeId, cameraId: deviceId }) => {
        this.initialize({ nodeId, deviceId });
        this.loading = true;
        this._presetService
          .findAll(this._nodeId, this._deviceId)
          .pipe(
            switchMap(({ data: presets }) => {
              this.presetList = presets;
              return this._patrolService.findAll(this._nodeId, this._deviceId);
            }),
            switchMap(({ data: patrols }) => {
              this.patrols =
                patrols?.map((p) => ({
                  value: p.id,
                  label: p.name,
                })) ?? [];
              return EMPTY;
            })
          )
          .subscribe({
            complete: () => {
              this.loading = false;
            },
            error: (err: HttpErrorResponse) => {
              this._toastService.showError(
                `Fetch data failed with error: ${
                  err.error?.message ?? err.message
                }`
              );
            },
          });
      });
  }

  ngOnDestroy(): void {
    this._activatedRouteSubscription?.unsubscribe();
  }

  trackByValue(_: any, item: SelectItemModel) {
    return item.value;
  }

  trackById(_: any, item: any) {
    return item.id;
  }

  onSelectedPatrolChanged() {
    this.patrolManagementList = [];

    if (this.selectedPatrol) {
      this.loadPatrolManagementList();
    }
  }

  add(content: TemplateRef<any>) {
    const index =
      this.patrols.filter((p) => /Patrol \d+/.test(p.label)).length + 1;
    this.patrolForm.reset({
      id: 0,
      name: `Patrol ${index}`,
    });
    this.activeModal = this._modalService.open(content, {
      size: 'sm',
    });

    this.activeModal.result
      .then(({ name }) => {
        this._patrolService
          .create(this._nodeId, this._deviceId, {
            name,
          })
          .subscribe({
            next: ({ data: id }) => {
              this.patrols = [
                ...this.patrols,
                {
                  value: id,
                  label: name,
                  selected: true,
                },
              ];

              this.selectedPatrol = this.patrols[this.patrols.length - 1];
              this._toastService.showSuccess('Create patrol successfully');
            },
            error: (err: HttpErrorResponse) =>
              this._toastService.showError(
                `Delete patrol failed with error: ${
                  err.error?.message ?? err.message
                }`
              ),
          });
      })
      .catch(() => {
        // Dismiss, ignore
      });
  }

  rename(content: TemplateRef<any>) {
    if (!this.selectedPatrol) {
      this._toastService.showError('No patrol selected');
      return;
    }

    const { value: id, label: name } = this.selectedPatrol;

    this.patrolForm.reset({
      id,
      name,
    });
    this.activeModal = this._modalService.open(content, {
      size: 'sm',
    });
    this.activeModal.result
      .then(({ id, name }) => {
        this._patrolService
          .update(this._nodeId, this._deviceId, {
            id,
            name,
          })
          .subscribe({
            complete: () => {
              const index = this.patrols.findIndex((p) => p.value === id);
              this.patrols[index].label = name;
              this.selectedPatrol!.label = name;

              this._toastService.showSuccess('Rename patrol successfully');
            },
            error: (err: HttpErrorResponse) =>
              this._toastService.showError(
                `Rename patrol failed with error: ${
                  err.error?.message ?? err.message
                }`
              ),
          });
      })
      .catch(() => {
        // Dismiss, ignore
      });
  }

  remove() {
    if (!this.selectedPatrol) {
      this._toastService.showError('No patrol selected');
      return;
    }

    this._patrolService
      .delete(this._nodeId, this._deviceId, this.selectedPatrol.value)
      .subscribe({
        next: () => {
          this._toastService.showSuccess('Delete patrol successfully');
          this.patrols = this.patrols.filter(
            (e) => e.value !== this.selectedPatrol?.value
          );
          this.selectedPatrol = undefined;
        },
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Delete patrol failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }

  addPatrolManagement() {
    const modalRef = this._modalService.open(PresetSelectDialogComponent);
    const component = modalRef.componentInstance as PresetSelectDialogComponent;
    component.presets = this.presetList
      .filter(
        (pr) => !this.patrolManagementList.some((pm) => pm.preset_id === pr.id)
      )
      .map((e) => ({
        value: e.id,
        label: e.name,
      }));
    modalRef.result
      .then(({ preset, standTime, movingTime }) => {
        const { value, label } = preset;
        const index =
          this.patrolManagementList.length === 0
            ? 0
            : this.patrolManagementList[this.patrolManagementList.length - 1]
                .index + 1;

        this.patrolManagementList.push({
          id: index,
          preset_id: value,
          presetName: label,
          isNew: true,
          patrol_id: parseInt(this.selectedPatrol!.value),
          moving_time: movingTime,
          stand_time: standTime,
          index,
        });
      })
      .catch(() => {
        // Dismiss, ignore
      });
  }

  detetePatrolManagement(item: PatrolManagementRowItem) {
    const func = (id: number) => {
      this._toastService.showSuccess(
        'Delete the patrol management successfully'
      );
      this.patrolManagementList = this.patrolManagementList.filter(
        (e) => e.id !== id
      );
    };

    if (item.isNew) {
      func(item.id);
      return;
    }

    this._patrolManagementService
      .delete(this._nodeId, this._deviceId, this.selectedPatrol!.value, item.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Delete the patrol management failed with error ${response.message}`
            );
          }

          return of(true);
        })
      )
      .subscribe({
        error: ({ message }) => this._toastService.showError(message),
        complete: () => func(item.id),
      });
  }

  loadPatrolManagementList() {
    this._patrolManagementService
      .findAll(this._nodeId, this._deviceId, this.selectedPatrol!.value)
      .subscribe({
        next: ({ data: patrolManagements }) => {
          this.patrolManagementList =
            patrolManagements?.map((pm) =>
              Object.assign({}, pm, {
                presetName: this.presetList.find(
                  (preset) => preset.id === pm.preset_id
                )?.name,
              })
            ) ?? [];
        },
        error: (err: HttpErrorResponse) => {
          this._toastService.showError(
            `Fetch data failed with error: ${err.error?.message ?? err.message}`
          );
        },
      });
  }

  submitPatrolManagementList() {
    const data: CreatePatrolManagementDto[] = this.patrolManagementList
      .filter((e) => e.isNew)
      .map((e) => ({
        preset_id: e.preset_id,
        stand_time: e.stand_time,
        moving_time: e.moving_time,
        index: e.index,
      }));
    this._patrolManagementService
      .create(this._nodeId, this._deviceId, this.selectedPatrol!.value, data)
      .subscribe({
        next: ({ data: idList }) => {
          console.log(idList);
          this._toastService.showSuccess(
            'Update patrol management list successfully'
          );

          // const i = 0;
          // this.patrolManagementList = this.patrolManagementList.map((e) => {
          //   if (!e.isNew) {
          //     return e;
          //   }

          //   e.id = idList[i];
          //   e.isNew = false;
          //   return e;
          // });
        },
        error: (err: HttpErrorResponse) => {
          this._toastService.showError(
            `Save the patrol management list failed with error: ${
              err.error?.message ?? err.message
            }`
          );
        },
      });
  }
}
