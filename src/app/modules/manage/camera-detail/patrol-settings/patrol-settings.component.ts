import { Component, OnInit, inject } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { ActivatedRoute } from '@angular/router';
import { PatrolService } from 'src/app/data/service/patrol.service';
import { of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import { v4 } from 'uuid';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PresetSelectDialogComponent } from './preset-select-dialog/preset-select-dialog.component';
import {
  CreatePatrolManagementDto,
  PatrolManagementService,
} from 'src/app/data/service/patrol-management.service';
import { PatrolManagement } from 'src/app/data/schema/boho-v2/patrol-management';
import { Preset } from 'src/app/data/schema/boho-v2/preset';

type PatrolManagementRowItem = PatrolManagement &
  Partial<{
    presetName: string;
    isNew: boolean;
  }>;

@Component({
  selector: 'app-patrol-settings',
  templateUrl: 'patrol-settings.component.html',
  styleUrls: ['patrol-settings.component.scss', '../../shared/my-input.scss'],
})
export class PatrolSettingsComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _patrolService = inject(PatrolService);
  private _patrolManagementService = inject(PatrolManagementService);
  private _presetService = inject(PresetService);
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _nodeId: string = '';
  private _cameraId: string = '';

  patrols: EditableListViewItemModel[] = [];
  presetList: Preset[] = [];
  patrolManagementList: PatrolManagementRowItem[] = [];
  selectedPatrol: EditableListViewItemModel | undefined;

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.PATROL_SETTINGS;
    this._activatedRoute.parent?.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this._nodeId = nodeId;
          this._cameraId = cameraId;
          return this._presetService.findAll(this._nodeId, this._cameraId);
        }),
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Fetch preset list failed with error: ${response.message}`
            );
          }

          this.presetList = response.data;
          return this._patrolService.findAll(this._nodeId, this._cameraId);
        }),
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Fetch patrol list failed with error: ${response.message}`
            );
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (patrols) => {
          this.patrols = (patrols ?? []).map((e) => ({
            id: e.id.toString(),
            label: e.name,
          }));
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  trackByValue(_: any, item: SelectItemModel) {
    return item.value;
  }

  trackById(_: any, item: any) {
    return item.id;
  }

  onPatrolSelected(patrol: EditableListViewItemModel) {
    this.selectedPatrol = patrol;

    // Clear the patrol management list of the previous patrol
    this.patrolManagementList = [];

    if (this.selectedPatrol.isNew) {
      return;
    }

    // Load the patrol management list of the current patrol from the backend
    this._patrolManagementService
      .findAll(this._nodeId, this._cameraId, this.selectedPatrol.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Load the patrol management list failed with error ${response.message}`
            );
          }

          return of(response.data || []);
        })
      )
      .subscribe({
        next: (data) => {
          this.patrolManagementList = data.map((patrolManagement) =>
            Object.assign({}, patrolManagement, {
              presetName: this.presetList.find(
                (preset) => preset.id === patrolManagement.preset_id
              )?.name,
            })
          );
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  add() {
    const item: EditableListViewItemModel = {
      id: v4(),
      label: `Patrol ${this.patrols.length + 1}`,
      isNew: true,
    };
    console.log('add: ', item);
    this.patrols.push(item);
  }

  save(item: EditableListViewItemModel) {
    if (item.isNew) {
      this._patrolService
        .create(this._nodeId, this._cameraId, { name: item.label })
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                'Create patrol failed with error: ' + response.message
              );
            }
            return of(response.data);
          })
        )
        .subscribe({
          next: (id) => {
            this._toastService.showSuccess('Create patrol successfully');
            item.id = id;
            item.isNew = false;
            this.selectedPatrol = item;
            this.patrolManagementList = [];
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } else {
      this._patrolService
        .update(this._nodeId, this._cameraId, {
          id: parseInt(item.id),
          name: item.label,
        })
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                'Update patrol failed with error: ' + response.message
              );
            }
            return of(true);
          })
        )
        .subscribe({
          next: () => {
            this._toastService.showSuccess('Update patrol successfully');
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    }
  }

  play() {}

  remove(item: EditableListViewItemModel) {
    const func = (id: string) => {
      this._toastService.showSuccess('Delete patrol successfully');
      this.patrols = this.patrols.filter((e) => e.id !== id);
    };

    if (item.isNew) {
      func(item.id);
      return;
    }

    this._patrolService
      .delete(this._nodeId, this._cameraId, item.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Delete patrol failed with error ${response.message}`);
          }

          return of(true);
        })
      )
      .subscribe({
        next: () => func(item.id),
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  addPatrolManagement() {
    if (!this.selectedPatrol) {
      this._toastService.showError('No patrol selected');
      return;
    }

    const modalRef = this._modalService.open(PresetSelectDialogComponent);
    const component = modalRef.componentInstance as PresetSelectDialogComponent;
    component.presets = this.presetList
      .filter(
        (preset) =>
          !this.patrolManagementList.some(
            (patrolManagement) => patrolManagement.preset_id === preset.id
          )
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
          patrol_id: parseInt(this.selectedPatrol!.id),
          moving_time: movingTime,
          stand_time: standTime,
          index,
        });
      })
      .catch(() => {});
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
      .delete(this._nodeId, this._cameraId, this.selectedPatrol!.id, item.id)
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

  updatePatrolManagementList() {
    if (!this.selectedPatrol) {
      this._toastService.showError('No patrol selected!!!');
      return;
    }

    if (this.presetList.length === 0) {
      this._toastService.showError('No preset selected!!!');
      return;
    }

    const data: CreatePatrolManagementDto[] = this.patrolManagementList
      .filter((e) => e.isNew)
      .map((e) => ({
        preset_id: e.preset_id,
        stand_time: e.stand_time,
        moving_time: e.moving_time,
        index: e.index,
      }));
    this._patrolManagementService
      .create(this._nodeId, this._cameraId, this.selectedPatrol.id, data)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Update the patrol management list failed with error ${response.message}`
            );
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (idList) => {
          this._toastService.showSuccess(
            'Update patrol management list successfully'
          );

          const i = 0;
          this.patrolManagementList = this.patrolManagementList.map((e) => {
            if (!e.isNew) {
              return e;
            }

            e.id = idList[i];
            e.isNew = false;
            return e;
          });
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }
}
