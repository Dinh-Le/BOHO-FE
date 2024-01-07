import { Component, OnInit, inject } from '@angular/core';
import { EditableListViewItemModel } from '../editable-list-view/editable-list-view-item.model';
import { PresetService } from 'src/app/data/service/preset.service';
import { ActivatedRoute } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { ToastService } from '@app/services/toast.service';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-preset-settings',
  templateUrl: 'preset-settings.component.html',
  styleUrls: ['preset-settings.component.scss', '../../shared/my-input.scss'],
})
export class PresetSettingsComponent implements OnInit {
  private _activatedRoute = inject(ActivatedRoute);
  private _navigationService = inject(NavigationService);
  private _presetService = inject(PresetService);
  private _toastService = inject(ToastService);
  presetList: EditableListViewItemModel[] = [];
  selectedItem: EditableListViewItemModel | undefined;
  nodeId = '';
  cameraId = '';

  ngOnInit(): void {
    this._navigationService.level3 = Level3Menu.PRESET_SETTINGS;
    this._activatedRoute.parent?.params
      .pipe(
        switchMap(({ nodeId, cameraId }) => {
          this.nodeId = nodeId;
          this.cameraId = cameraId;
          return this._presetService.findAll(nodeId, cameraId);
        })
      )
      .subscribe({
        next: (response) => {
          this.presetList = response.data.map((e) => ({
            id: e.id.toString(),
            label: e.name,
          }));
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  load() {
    this._presetService
      .loadFromCamera(this.nodeId, this.cameraId)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Load preset failed with error: ${response.message}`);
          }

          return of(response.data);
        })
      )
      .subscribe({
        error: ({ message }) => this._toastService.showError(message),
        next: (presets) => {
          this.presetList = presets.map((e) => ({
            id: e.id.toString(),
            label: e.name,
          }));
        },
      });
  }

  play() {}

  remove(item: EditableListViewItemModel) {
    this._presetService
      .delete(this.nodeId, this.cameraId, parseInt(item.id))
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Delete preset failed with error: ${response.message}`);
          }

          return of(response);
        })
      )
      .subscribe({
        next: () => {
          this._toastService.showSuccess('Delete preset successfully');
          this.presetList = this.presetList.filter((e) => e.id !== item.id);
        },
        error: ({ message }) => this._toastService.showError(message),
      });
  }

  save(item: EditableListViewItemModel) {
    this._presetService
      .update(this.nodeId, this.cameraId, parseInt(item.id), {
        name: item.label,
      })
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Update preset failed with error: ${response.message}`);
          }

          return of(response);
        })
      )
      .subscribe({
        next: () =>
          this._toastService.showSuccess('Update preset successfully'),
        error: ({ message }) => this._toastService.showError(message),
      });
  }
}
