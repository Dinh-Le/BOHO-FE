import { Rule } from 'src/app/data/schema/boho-v2/rule';
import {
  AutoTrackingOptions,
  ZoomAndFocusOptions,
} from '../camera-detail/models';
import { PostActionType } from 'src/app/data/data.types';
import { Nullable } from '@shared/shared.types';
import {
  AutoTrackOptions,
  ZoomAndCentralizeOptions,
} from 'src/app/data/schema/boho-v2';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 } from 'uuid';

export class PostActionItemModel {
  public form = new FormGroup({
    id: new FormControl<string | number>(v4()),
    selected: new FormControl<boolean>(false, [Validators.required]),
    rule_ids: new FormControl<number[]>([]),
    post_action_type: new FormControl<PostActionType>('auto_track', [
      Validators.required,
    ]),
  });

  private _postActionOptions: Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >;

  get postActionOptions(): Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  > {
    return Object.assign({}, this._postActionOptions);
  }

  set postActionOptions(
    value: Nullable<ZoomAndCentralizeOptions | AutoTrackOptions>
  ) {
    if (value) {
      this._postActionOptions = Object.assign({}, value);
    } else {
      this._postActionOptions = null;
    }
  }

  get id(): string | number {
    return this.form.controls.id.value!;
  }

  get selected(): boolean {
    return this.form.controls.selected.value!;
  }

  get postActionType(): PostActionType {
    return this.form.controls.post_action_type.value!;
  }

  get ruleIds(): number[] {
    return this.form.controls.rule_ids.value ?? [];
  }

  constructor() {
    this.form.controls.post_action_type.valueChanges.subscribe((value) => {
      switch (value) {
        case 'auto_track':
          this._postActionOptions = {
            zoom_level: 1,
            pantilt_speed: 3,
            roi: [],
            timeout: 5,
            working_time: 30,
          };
          break;
        case 'zoom_and_centralize':
          this._postActionOptions = {
            zoom_level: 1,
            working_time: 30,
          };
          break;
        default:
          this._postActionOptions = null;
      }
    });
  }
}
