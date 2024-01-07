import { Component, OnInit, inject } from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { ActivatedRoute } from '@angular/router';
import { PatrolService } from 'src/app/data/service/patrol.service';
import { of, switchMap, zip } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import { v4 } from 'uuid';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';
import { PresetService } from 'src/app/data/service/preset.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PresetSelectDialogComponent } from './preset-select-dialog/preset-select-dialog.component';

@Component({
  selector: 'app-patrol-settings',
  templateUrl: 'patrol-settings.component.html',
  styleUrls: ['patrol-settings.component.scss', '../../shared/my-input.scss'],
})
export class PatrolSettingsComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _patrolService = inject(PatrolService);
  private _presetService = inject(PresetService);
  private _modalService = inject(NgbModal);
  private _navigationService = inject(NavigationService);
  private _nodeId: string = '';
  private _cameraId: string = '';

  patrols: EditableListViewItemModel[] = [];
  presetList: {
    id: string;
    name: string;
    stand_time: number;
    moving_time: number;
    patrol_id: number;
    index: number;
  }[] = [];

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.PATROL_SETTINGS;
    this._activatedRoute.parent?.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this._nodeId = nodeId;
          this._cameraId = cameraId;

          return this._patrolService.findAll(nodeId, cameraId);
        })
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            throw Error(
              'Fetch patrol data failed with error: ' + response.message
            );
          }

          this.patrols = (response.data ?? []).map((e) => ({
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

  selectedPatrol: EditableListViewItemModel | undefined;
  onPatrolSelected(patrol: EditableListViewItemModel) {
    this.selectedPatrol = patrol;
    this._patrolService
      .getPatrolManagement(this._nodeId, this._cameraId, this.selectedPatrol.id)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Load preset list failed with error ${response.message}`
            );
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (data) => {
          const keys = [
            'id',
            'index',
            'moving_time',
            'patrol_id',
            'preset_id',
            'stand_time',
          ];
          this.presetList = data.map(
            (e: any) =>
              keys.reduce((data, key) =>
                Object.assign(data, {
                  [key]: e[key],
                })
              ),
            {}
          );
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  add() {
    this.patrols.push({
      id: `new_${v4()}`,
      label: 'Patrol',
      isEditable: true,
      isSelected: true,
    });
  }

  save({ id, label }: EditableListViewItemModel) {
    if (id.startsWith('new_')) {
      this._patrolService
        .create(this._nodeId, this._cameraId, { name: label })
        .subscribe({
          next: (response) => {
            if (!response.success) {
              throw Error(
                'Create patrol failed with error: ' + response.message
              );
            }

            this.patrols.find((e) => e.id === id)!.id = response.data;
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    } else {
      this._patrolService
        .update(this._nodeId, this._cameraId, {
          id: parseInt(id),
          name: label,
        })
        .subscribe({
          next: (response) => {
            if (!response.success) {
              throw Error(
                'Update patrol failed with error: ' + response.message
              );
            }
          },
          error: ({ message }) => this._toastService.showError(message),
        });
    }
  }

  play() {}

  remove(item: EditableListViewItemModel) {
    if (item.id.startsWith('new_')) {
      this.patrols = this.patrols.filter((e) => e.id !== item.id);
      return;
    }

    this._patrolService
      .delete(this._nodeId, this._cameraId, item.id)
      .subscribe({
        next: (response) => {
          if (!response.success) {
            throw Error('Delete patrol failed with error: ' + response.message);
          }

          this.patrols = this.patrols.filter((e) => e.id !== item.id);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  removePreset(item: any) {
    this.presetList = this.presetList.filter((e) => e.id !== item.id);
  }

  addPreset() {
    const modalRef = this._modalService.open(PresetSelectDialogComponent);
    const component = modalRef.componentInstance as PresetSelectDialogComponent;
    component.nodeId = this._nodeId;
    component.deviceId = this._cameraId;
    modalRef.result
      .then(({ presets }) => {
        this.presetList = presets.map((e: any) => ({
          id: e.value,
          name: e.label,
          stand_time: 1,
          moving_time: 1,
        }));
      })
      .catch(() => {});
  }

  updatePresetList() {
    if (!this.selectedPatrol) {
      this._toastService.showError('No patrol selected!!!');
      return;
    }

    if (this.presetList.length === 0) {
      this._toastService.showError('No preset selected!!!');
      return;
    }

    const data: {
      preset_id: number;
      stand_time: number;
      moving_time: number;
      index: number;
    }[] = this.presetList.map((e, index) => ({
      preset_id: parseInt(e.id),
      stand_time: 1,
      moving_time: 1,
      index: index,
    }));
    this._patrolService
      .createPatrolManagement(
        this._nodeId,
        this._cameraId,
        this.selectedPatrol.id,
        data
      )
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(
              `Update preset list failed with error ${response.message}`
            );
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (data) => {
          console.log(data);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }
}
