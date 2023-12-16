import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { SelectItemModel } from '@shared/models/select-item-model';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { ActivatedRoute } from '@angular/router';
import { PatrolService } from 'src/app/data/service/patrol.service';
import { switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import { v4 } from 'uuid';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-patrol-settings',
  templateUrl: 'patrol-settings.component.html',
  styleUrls: ['patrol-settings.component.scss', '../../shared/my-input.scss'],
})
export class PatrolSettingsComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _patrolService = inject(PatrolService);
  private _navigationService = inject(NavigationService);
  private _nodeId: string = '';
  private _cameraId: string = '';

  patrols: EditableListViewItemModel[] = [];
  presetList: SelectItemModel[] = [];

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
    this.presetList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => ({
      value: e,
      label: `Điểm giám sát ${e}`,
      selected: false,
    }));
  }

  trackByValue(_: any, item: SelectItemModel) {
    return item.value;
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

  removePreset(item: SelectItemModel) {
    this.presetList = this.presetList.filter((e) => e.value !== item.value);
  }
}
