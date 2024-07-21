import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';
import { Point } from '@shared/components/bounding-box-editor/bounding-box-editor.component';
import { PostActionType } from 'src/app/data/data.types';
import {
  AutoTrackOptions,
  ZoomAndCentralizeOptions,
} from 'src/app/data/schema/boho-v2';
import { Nullable } from '@shared/shared.types';

@Component({
  selector: 'app-post-action-options',
  templateUrl: 'post-action-options.component.html',
  styleUrls: ['post-action-options.component.scss'],
})
export class PostActionOptionsComponent implements OnChanges {
  readonly zoomLevelItemsSource: SelectItemModel[] = [
    {
      value: 1,
      label: 'Nhỏ',
    },
    {
      value: 2,
      label: 'Vừa',
    },
    {
      value: 3,
      label: 'Lớn',
    },
  ];

  @Input({ required: true }) type: PostActionType = 'zoom_and_centralize';
  @Input({ required: true }) data: Nullable<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >;
  @Input() nodeId: Nullable<string>;
  @Input() deviceId: Nullable<number>;
  @Input() presetId: Nullable<number>;
  @Output() exit = new EventEmitter();
  @Output() save = new EventEmitter<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >();

  private _zoomAndCentralizeFormGroup = new FormGroup({
    zoom_level: new FormControl<number>(1, [Validators.required]),
    working_time: new FormControl<number>(2, [
      Validators.min(1),
      Validators.max(10),
      Validators.required,
    ]),
  });
  private _autoTrackFormGroup = new FormGroup({
    pantilt_speed: new FormControl<number>(3, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    timeout: new FormControl<number>(5, [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    zoom_level: new FormControl<number>(1, [Validators.required]),
    zoom_speed: new FormControl<number>(3, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    working_time: new FormControl<number>(30, [
      Validators.required,
      Validators.min(5),
      Validators.max(60),
    ]),
    roi: new FormControl<Point[]>(
      [],
      (): ValidatorFn =>
        (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;

          if (Array.isArray(value) && value.length > 0) {
            return null;
          }

          return { required: true };
        }
    ),
  });

  get formGroup() {
    return this.type === 'zoom_and_centralize'
      ? this._zoomAndCentralizeFormGroup
      : this._autoTrackFormGroup;
  }

  get canSubmit() {
    return this.formGroup.valid;
  }

  get boundingBoxEditorSrc(): {
    nodeId: Nullable<string>;
    deviceId: Nullable<number>;
    presetId: Nullable<number>;
  } {
    return {
      nodeId: this.nodeId,
      deviceId: this.deviceId,
      presetId: this.presetId,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      Object.entries(changes['data'].currentValue).forEach(([key, value]) => {
        if (key === 'roi') {
          this._autoTrackFormGroup.get(key)?.reset(
            (value as number[][]).map((point) => ({
              x: point[0],
              y: point[1],
            }))
          );
        }
        this._zoomAndCentralizeFormGroup.get(key)?.reset(value);
      });
    }
  }

  onSaveClicked() {
    const data =
      this.type === 'zoom_and_centralize'
        ? (Object.assign(
            {},
            this._zoomAndCentralizeFormGroup.value
          ) as ZoomAndCentralizeOptions)
        : (Object.assign({}, this._autoTrackFormGroup.value, {
            roi:
              this._autoTrackFormGroup.controls.roi.value?.map(({ x, y }) => [
                x,
                y,
              ]) ?? [],
          }) as AutoTrackOptions);

    this.save.emit(data);
  }
}
