import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastService } from '@app/services/toast.service';
import { getDefaultPostionActionOptions } from '@modules/manage/ptz-post-action/models';
import { Nullable } from '@shared/shared.types';
import { tap, switchMap, of, catchError } from 'rxjs';
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
    id: new FormControl<number>(+InvalidId, Validators.required),
    selected: new FormControl<boolean>(false, [Validators.required]),
    nodeId: new FormControl<string>('', [Validators.required]),
    deviceId: new FormControl<number>(+InvalidId, [Validators.required]),
    targetDeviceId: new FormControl<number>(+InvalidId, [Validators.required]),
    presetId: new FormControl<Nullable<number>>(+InvalidId, [
      Validators.required,
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

  get targetDeviceId(): number {
    return this.form.controls.targetDeviceId.value!;
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
      this.form.controls.postActionType.value !== 'none' &&
      this.targetDeviceId !== +InvalidId &&
      this.presetId !== +InvalidId
    );
  }

  constructor(
    private presetService: PresetService,
    private toastService: ToastService,
    nodeId: string,
    deviceId: number,
    data?: Handover
  ) {
    this.form.controls.nodeId.setValue(nodeId);
    this.form.controls.deviceId.setValue(deviceId);
    this.form.controls.postActionType.valueChanges.subscribe((value) => {
      this.postActionOptions = getDefaultPostionActionOptions(value!);
    });
    this.form.controls.targetDeviceId.valueChanges.subscribe((value) =>
      this.presetService
        .findAll(this.form.controls.nodeId.value!, value!)
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

    if (data) {
      this.setData(data);
    }
  }

  setData(data: Handover) {
    this.form.patchValue({
      id: data.id,
      targetDeviceId: data.target_device_id,
      presetId: data.preset_id,
      selected: false,
      postActionType: getPostActionTypeByHandover(data),
    });

    this.postActionOptions =
      data.action?.auto_track ?? data.action?.zoom_and_centralize;
  }
}
