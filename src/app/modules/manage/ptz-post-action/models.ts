import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Nullable } from '@shared/shared.types';
import { InvalidId } from 'src/app/data/constants';
import { PostActionType } from 'src/app/data/data.types';
import {
  AutoTrackOptions,
  getPostActionType,
  PostAction,
  ZoomAndCentralizeOptions,
} from 'src/app/data/schema/boho-v2';
import { v4 } from 'uuid';

export function getDefaultPostionActionOptions(
  type: PostActionType
): Nullable<ZoomAndCentralizeOptions | AutoTrackOptions> {
  switch (type) {
    case 'auto_track':
      return {
        zoom_level: 1,
        pantilt_speed: 3,
        roi: [],
        timeout: 5,
        working_time: 30,
      };
    case 'zoom_and_centralize':
      return {
        zoom_level: 1,
        working_time: 2,
      };
    default:
      return null;
  }
}

export class PTZPostActionItemModel {
  private _postActionOptions: Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >;
  form = new FormGroup({
    id: new FormControl<number>(+InvalidId, [Validators.required]),
    key: new FormControl<string>(v4(), [Validators.required]),
    selected: new FormControl<boolean>(false, [Validators.required]),
    presetId: new FormControl<number>(+InvalidId, [
      Validators.required,
      Validators.min(1),
    ]),
    postActionType: new FormControl<PostActionType>('none', [
      Validators.required,
    ]),
  });

  get isNewItem(): boolean {
    return this.form.controls.id.value === +InvalidId;
  }

  get valid(): boolean {
    return this.form.valid;
  }

  get selected(): boolean {
    return this.form.controls.selected.value!;
  }

  get postActionType(): PostActionType {
    return this.form.controls.postActionType.value!;
  }

  get presetId(): number {
    return this.form.controls.presetId.value!;
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

  get id(): number {
    return this.form.controls.id.value!;
  }

  set id(value: number) {
    this.form.controls.id.setValue(value, { emitEvent: false });
  }

  constructor(data?: PostAction) {
    this.form.controls.postActionType.valueChanges.subscribe((value) => {
      this._postActionOptions = getDefaultPostionActionOptions(value ?? 'none');
    });

    if (data) {
      this.form.patchValue({
        id: data.id,
        postActionType: getPostActionType(data),
        presetId: data.preset_id,
      });
    }
  }
}
