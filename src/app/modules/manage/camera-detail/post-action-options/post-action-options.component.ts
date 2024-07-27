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
export class PostActionOptionsComponent {
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

  @Input({ required: true }) set type(value: PostActionType) {
    this.formGroup.controls.type.setValue(value);
  }
  get type(): PostActionType {
    return this.formGroup.controls.type.value!;
  }

  @Input({ required: true }) set data(
    value: Nullable<ZoomAndCentralizeOptions | AutoTrackOptions>
  ) {
    if (value) {
      Object.entries(value).forEach(([k, v]) => {
        if (k === 'roi') {
          this.formGroup.controls.roi.reset(
            (v as number[][]).map((point) => ({
              x: point[0],
              y: point[1],
            }))
          );
        } else {
          this.formGroup.get(k)?.setValue(v);
        }
      });
    }
  }
  @Input() nodeId: Nullable<string>;
  @Input() deviceId: Nullable<number>;
  @Input() presetId: Nullable<number>;
  @Output() exit = new EventEmitter();
  @Output() save = new EventEmitter<
    ZoomAndCentralizeOptions | AutoTrackOptions
  >();

  formGroup = new FormGroup({
    type: new FormControl<PostActionType>('zoom_and_centralize', [
      Validators.required,
    ]),
    pantilt_speed: new FormControl<number>(3),
    timeout: new FormControl<number>(5),
    zoom_level: new FormControl<number>(1, [Validators.required]),
    zoom_speed: new FormControl<number>(3),
    working_time: new FormControl<number>(30, [
      Validators.required,
      Validators.min(5),
      Validators.max(60),
    ]),
    roi: new FormControl<Point[]>([]),
  });

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

  constructor() {
    this.formGroup.controls.type.valueChanges.subscribe((value) => {
      if (value === 'auto_track') {
        this.formGroup.controls.working_time.setValue(30);
        this.formGroup.controls.working_time.setValidators([
          Validators.required,
          Validators.min(5),
          Validators.max(60),
        ]);
        this.formGroup.controls.pantilt_speed.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(5),
        ]);
        this.formGroup.controls.zoom_speed.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(5),
        ]);
        this.formGroup.controls.timeout.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(10),
        ]);
        this.formGroup.controls.roi.setValidators([
          (): ValidatorFn =>
            (control: AbstractControl): ValidationErrors | null => {
              const value = control.value;

              if (Array.isArray(value) && value.length > 0) {
                return null;
              }

              return { required: true };
            },
        ]);
      } else {
        this.formGroup.controls.working_time.setValue(2);
        this.formGroup.controls.working_time.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(10),
        ]);
        this.formGroup.controls.pantilt_speed.clearValidators();
        this.formGroup.controls.zoom_speed.clearValidators();
        this.formGroup.controls.timeout.clearValidators();
        this.formGroup.controls.roi.clearValidators();
      }
    });
  }

  onSaveClicked() {
    const data =
      this.type === 'zoom_and_centralize'
        ? ({
            zoom_level: this.formGroup.controls.zoom_level.value,
            working_time: this.formGroup.controls.working_time.value,
          } as ZoomAndCentralizeOptions)
        : ({
            pantilt_speed: this.formGroup.controls.pantilt_speed.value,
            timeout: this.formGroup.controls.timeout.value,
            zoom_level: this.formGroup.controls.zoom_level.value,
            working_time: this.formGroup.controls.working_time.value,
            zoom_speed: this.formGroup.controls.zoom_speed.value,
            roi:
              this.formGroup.controls.roi.value?.map(({ x, y }) => [x, y]) ??
              [],
          } as AutoTrackOptions);

    this.save.emit(data);
  }

  trackByValue(_: any, item: SelectItemModel) {
    return item.value;
  }
}
