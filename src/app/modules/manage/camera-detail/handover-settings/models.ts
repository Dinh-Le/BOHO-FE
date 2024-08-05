import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from '@app/services/toast.service';
import { getDefaultPostionActionOptions } from '@modules/manage/ptz-post-action/models';
import { Nullable } from '@shared/shared.types';
import { tap, of, catchError, map } from 'rxjs';
import { InvalidId } from 'src/app/data/constants';
import { PostActionType } from 'src/app/data/data.types';
import {
  ZoomAndCentralizeOptions,
  AutoTrackOptions,
  Handover,
  getPostActionTypeByHandover,
} from 'src/app/data/schema/boho-v2';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { PresetService } from 'src/app/data/service/preset.service';
import { v4 } from 'uuid';

export default class HandoverRowItemModel {
  presets: Preset[] = [];
  private _postActionOptions: Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >;
  form = new FormGroup({
    key: new FormControl<string>(v4(), Validators.required),
    id: new FormControl<number>(+InvalidId, [
      Validators.required,
      Validators.min(0),
    ]),
    nodeId: new FormControl<string>('', Validators.required),
    selected: new FormControl<boolean>(false, [Validators.required]),
    deviceId: new FormControl<number>(+InvalidId, [
      Validators.required,
      Validators.min(0),
    ]),
    presetId: new FormControl<Nullable<number>>(+InvalidId, [
      Validators.required,
      Validators.min(0),
    ]),
    postActionType: new FormControl<PostActionType>('none', [
      Validators.required,
    ]),
  });

  get isNew(): boolean {
    return this.id === +InvalidId;
  }

  get key(): string {
    return this.form.controls.key.value!;
  }

  get id(): number {
    return this.form.controls.id.value!;
  }

  set id(value: number) {
    this.form.controls.id.setValue(value);
  }

  get selected(): boolean {
    return this.form.controls.selected.value!;
  }

  get nodeId(): string {
    return this.form.controls.nodeId.value!;
  }

  get deviceId(): number {
    return this.form.controls.deviceId.value!;
  }

  get presetId(): number {
    return this.form.controls.presetId.value!;
  }

  get postActionType(): PostActionType {
    return this.form.controls.postActionType.value!;
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
    return (
      this.form.valid && this.form.controls.postActionType.value !== 'none'
    );
  }

  constructor(
    private presetService: PresetService,
    private toastService: ToastService,
    nodeId: string,
    data?: Handover
  ) {
    this.form.controls.postActionType.valueChanges.subscribe((value) => {
      this.postActionOptions = getDefaultPostionActionOptions(value!);
    });
    this.form.controls.deviceId.valueChanges.subscribe((value) => {
      this.form.controls.presetId.setValue(+InvalidId);
      this.presetService
        .findAll(this.nodeId, value!)
        .pipe(
          tap(() => (this.presets = [])),
          map((response) => response.data),
          catchError((error: HttpErrorResponse) => {
            this.toastService.showError(
              'Lỗi lấy danh sách preset: ' + error.error?.message ??
                error.message
            );
            return of([]);
          })
        )
        .subscribe((presets) => (this.presets = presets));
    });

    this.form.patchValue({
      nodeId,
      deviceId: data?.target_device_id ?? +InvalidId,
      id: data?.id ?? +InvalidId,
      presetId: data?.preset_id ?? +InvalidId,
      selected: false,
      postActionType: data ? getPostActionTypeByHandover(data) : 'none',
    });

    this.postActionOptions =
      data?.action?.auto_track ?? data?.action?.zoom_and_centralize;
  }
}
