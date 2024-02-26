import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { ActivatedRoute } from '@angular/router';
import { PatrolService } from 'src/app/data/service/patrol.service';
import {
  EMPTY,
  Subscription,
  catchError,
  concat,
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
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PresetSelectDialogComponent } from './preset-select-dialog/preset-select-dialog.component';
import { PatrolManagementService } from 'src/app/data/service/patrol-management.service';
import { PatrolManagement } from 'src/app/data/schema/boho-v2/patrol-management';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InvalidId } from 'src/app/data/constants';

type PatrolManagementRowItem = PatrolManagement &
  Partial<{
    presetName: string;
    isNew: boolean;
    isDeleted: boolean;
    isSelected: boolean;
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
  private _nodeId: string = '';
  private _deviceId: string = '';

  selectedPatrol?: SelectItemModel;
  activeModal?: NgbModalRef;
  patrols: SelectItemModel[] = [];
  presetList: Preset[] = [];
  private _patrolManagements: PatrolManagementRowItem[] = [];
  private _activatedRouteSubscription: Subscription | undefined;
  loading: boolean = false;

  patrolForm = new FormGroup({
    id: new FormControl<number>(0, [Validators.required]),
    name: new FormControl<string>('', [Validators.required]),
  });

  get patrolManagements(): PatrolManagementRowItem[] {
    return this._patrolManagements.filter((pm) => !pm.isDeleted);
  }

  get canDeletePatrolManagement(): boolean {
    return this._patrolManagements.some((pm) => pm.isSelected && !pm.isDeleted);
  }

  private initialize({ nodeId, deviceId }: any) {
    this._nodeId = nodeId;
    this._deviceId = deviceId;
    this.patrols = [];
    this._patrolManagements = [];
    this.selectedPatrol = undefined;
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
    this._patrolManagements = [];

    if (this.selectedPatrol?.value != InvalidId) {
      this.loadPatrolManagementList().subscribe();
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
        this.patrols = [
          ...this.patrols,
          {
            value: InvalidId,
            label: name,
          },
        ];
        this.selectedPatrol = this.patrols[this.patrols.length - 1];
      })
      .catch(() => {
        // Dismiss, ignore
      });
  }

  rename(content: TemplateRef<any>) {
    const { value: id, label: name } = this.selectedPatrol!;

    this.patrolForm.reset({
      id,
      name,
    });
    this.activeModal = this._modalService.open(content, {
      size: 'sm',
    });
    this.activeModal.result
      .then(({ id, name }) => {
        this.patrols = this.patrols.map((p) =>
          p.value === id ? Object.assign(p, { label: name }) : p
        );
      })
      .catch(() => {
        // Dismiss, ignore
      });
  }

  remove() {
    const func = () => {
      this.patrols = this.patrols.filter(
        (e) => e.value !== this.selectedPatrol?.value
      );
      this.selectedPatrol = undefined;
      this._patrolManagements = [];
    };

    if (this.selectedPatrol?.value === InvalidId) {
      func();
      return;
    }

    this._patrolService
      .delete(this._nodeId, this._deviceId, this.selectedPatrol!.value)
      .subscribe({
        complete: () => {
          this._toastService.showSuccess('Delete patrol successfully');
          func();
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
        (pr) => !this._patrolManagements.some((pm) => pm.preset_id === pr.id)
      )
      .map((e) => ({
        value: e.id,
        label: e.name,
      }));
    modalRef.result
      .then(({ preset, standTime, movingTime }) => {
        const { value, label } = preset;
        const index =
          this._patrolManagements.length === 0
            ? 0
            : this._patrolManagements[this._patrolManagements.length - 1]
                .index + 1;

        this._patrolManagements.push({
          id: index,
          preset_id: value,
          presetName: label,
          isNew: true,
          patrol_id: this.selectedPatrol?.value,
          moving_time: movingTime,
          stand_time: standTime,
          index,
        });
      })
      .catch(() => {
        // Dismiss, ignore
      });
  }

  removeSelectedPatrolManagement() {
    this._patrolManagements = this._patrolManagements
      .filter((pm) => !(pm.isSelected && pm.isNew)) // filter out items that are new item and selected
      .map((pm) =>
        pm.isSelected
          ? Object.assign(pm, { isSelected: false, isDeleted: true })
          : pm
      );
  }

  loadPatrolManagementList() {
    return this._patrolManagementService
      .findAll(this._nodeId, this._deviceId, this.selectedPatrol!.value)
      .pipe(
        switchMap(({ data: patrolManagements }) => {
          this._patrolManagements =
            patrolManagements?.map((pm) =>
              Object.assign({}, pm, {
                presetName: this.presetList.find(
                  (preset) => preset.id === pm.preset_id
                )?.name,
              })
            ) ?? [];
          return EMPTY;
        }),
        catchError((err: HttpErrorResponse) => {
          this._toastService.showError(
            `Fetch patrol management list failed with error: ${
              err.error?.message ?? err.message
            }`
          );
          return EMPTY;
        })
      );
  }

  cancel() {
    this.loading = true;
    this._patrolService
      .find(this._nodeId, this._deviceId, this.selectedPatrol?.value)
      .pipe(
        switchMap(({ data: patrol }) => {
          if (this.selectedPatrol?.label !== patrol.name) {
            this.patrols = this.patrols.map((p) =>
              p.value === patrol.id
                ? Object.assign(p, { label: patrol.name })
                : p
            );
          }

          return this.loadPatrolManagementList();
        })
      )
      .subscribe({
        complete: () => (this.loading = false),
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Fetch patrol data failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }

  save(ev: Event) {
    const btn = ev.target as HTMLButtonElement;

    const createPatrol$ =
      this.selectedPatrol?.value === InvalidId
        ? this._patrolService
            .create(this._nodeId, this._deviceId, {
              name: this.selectedPatrol!.label,
            })
            .pipe(
              switchMap(({ data: id }) => {
                this.patrols = this.patrols.map((p) =>
                  p.value === id ? Object.assign(p, { value: id }) : p
                );
                this._patrolManagements.forEach(
                  (pm) => (pm.patrol_id = parseInt(id))
                );
                this.selectedPatrol!.value = id;
                return EMPTY;
              })
            )
        : this._patrolService.update(this._nodeId, this._deviceId, {
            id: this.selectedPatrol!.value,
            name: this.selectedPatrol!.label,
          });

    const deletePatrolManagements$ = concat(
      ...this._patrolManagements
        .filter((pm) => pm.isDeleted)
        .map((pm) =>
          this._patrolManagementService.delete(
            this._nodeId,
            this._deviceId,
            this.selectedPatrol?.value,
            pm.id
          )
        )
    ).pipe(
      toArray(),
      switchMap(() => {
        this._patrolManagements = this._patrolManagements.filter(
          (pm) => !pm.isDeleted
        );
        return EMPTY;
      })
    );

    const newPatrolManagements = this.patrolManagements
      .filter((pm) => pm.isNew)
      .map(({ preset_id, stand_time, moving_time, index }) => ({
        preset_id,
        stand_time,
        moving_time,
        index,
      }));
    const createPatrolManagements$ =
      newPatrolManagements.length > 0
        ? of(true).pipe(
            switchMap(() =>
              this._patrolManagementService.create(
                this._nodeId,
                this._deviceId,
                this.selectedPatrol!.value,
                newPatrolManagements
              )
            ),
            switchMap(({ data: idList }) => {
              idList.forEach((id, index) => {
                const pm = this._patrolManagements.find(
                  (pm) => pm.index === newPatrolManagements[index].index
                );
                if (pm) {
                  pm.id = id;
                  pm.isSelected = false;
                  pm.isNew = false;
                }
              });
              this._patrolManagements = [...this.patrolManagements];
              return EMPTY;
            })
          )
        : EMPTY;

    concat(createPatrol$, deletePatrolManagements$, createPatrolManagements$)
      .pipe(
        tap(() => {
          btn.disabled = true;
          this.loading = true;
        }),
        finalize(() => {
          btn.disabled = false;
          this.loading = false;
        }),
        toArray()
      )
      .subscribe({
        complete: () =>
          this._toastService.showSuccess(
            'Save the patrol settings successfully'
          ),
        error: (err: HttpErrorResponse) =>
          this._toastService.showError(
            `Save the patrol settings failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }
}
