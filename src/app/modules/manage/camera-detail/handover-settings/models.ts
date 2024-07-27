import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from '@app/services/toast.service';
import { Nullable } from '@shared/shared.types';
import { filter, tap, switchMap, of, catchError } from 'rxjs';
import { InvalidId } from 'src/app/data/constants';
import { PostActionType } from 'src/app/data/data.types';
import {
  ZoomAndCentralizeOptions,
  AutoTrackOptions,
  Handover,
} from 'src/app/data/schema/boho-v2';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { PresetService } from 'src/app/data/service/preset.service';
import { v4 } from 'uuid';

export class RowItemModel {
  _isNew: boolean = true;
  presets: Preset[] = [];
  private _postActionOptions: Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >;
  form = new FormGroup({
    id: new FormControl<string | number>(v4(), Validators.required),
    node_id: new FormControl<string>('', [Validators.required]),
    selected: new FormControl<boolean>(false, [Validators.required]),
    device_id: new FormControl<Nullable<number>>(null, [Validators.required]),
    preset_id: new FormControl<Nullable<number>>(null, [Validators.required]),
    post_action_type: new FormControl<PostActionType>('none', [
      Validators.required,
    ]),
  });

  get isNew(): boolean {
    return this._isNew;
  }

  get id(): string | number {
    return this.form.controls.id.value!;
  }

  set id(value: string | number) {
    this.form.controls.id.setValue(+value);
    this._isNew = false;
  }

  get selected(): boolean {
    return this.form.controls.selected.value!;
  }

  get nodeId(): string {
    return this.form.controls.node_id.value ?? '';
  }

  get deviceId(): number {
    return this.form.controls.device_id.value ?? +InvalidId;
  }

  get presetId(): number {
    return this.form.controls.preset_id.value ?? +InvalidId;
  }

  get postActionType(): PostActionType {
    return this.form.controls.post_action_type.value!;
  }

  get postActionOptions(): Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  > {
    return this._postActionOptions;
  }

  set postActionOptions(
    value: Nullable<ZoomAndCentralizeOptions | AutoTrackOptions>
  ) {
    this._postActionOptions = value;
  }

  get canConfigurePostAction(): boolean {
    return this.form.controls.post_action_type.value !== 'none';
  }

  constructor(
    nodeId: string,
    private presetService: PresetService,
    private toastService: ToastService
  ) {
    this.form.controls.node_id.setValue(nodeId);
    this.form.controls.post_action_type.valueChanges.subscribe((value) => {
      switch (value) {
        case 'auto_track':
          this._postActionOptions = {
            pantilt_speed: 3,
            zoom_speed: 5,
            timeout: 5,
            zoom_level: 1,
            working_time: 30,
            roi: [],
          };
          break;
        case 'zoom_and_centralize':
          this._postActionOptions = {
            zoom_level: 1,
            working_time: 2,
          };
          break;
        default:
          this._postActionOptions = null;
          break;
      }
    });
    this.form.controls.device_id.valueChanges
      .pipe(filter((value) => !!value && !!this.form.controls.node_id.value))
      .subscribe((value) =>
        this.presetService
          .findAll(this.form.controls.node_id.value!, value!)
          .pipe(
            tap(() => (this.presets = [])),
            switchMap((response) => of(response.data)),
            catchError((error: HttpErrorResponse) => {
              this.toastService.showHttpError(error);
              return of([]);
            })
          )
          .subscribe((presets) => (this.presets = presets))
      );
  }

  setData(data: Handover) {
    this._isNew = !Number.isInteger(data.id);

    this.form.patchValue({
      id: data.id,
      device_id: data.device_id,
      preset_id: data.preset_id,
      selected: false,
    });

    if (data.action?.zoom_and_centralize) {
      this.form.controls.post_action_type.setValue('zoom_and_centralize');
    } else if (data.action?.auto_track) {
      this.form.controls.post_action_type.setValue('auto_track');
    } else {
      this.form.controls.post_action_type.setValue('none');
    }

    this.postActionOptions =
      data.action?.auto_track ?? data.action?.zoom_and_centralize;
  }
}
