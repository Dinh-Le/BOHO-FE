import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AutoTrackingOptions,
  PostActionType,
  ZoomAndFocusOptions,
} from '../models';
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

@Component({
  selector: 'app-post-action-options',
  templateUrl: 'post-action-options.component.html',
  styleUrls: ['post-action-options.component.scss'],
})
export class PostActionOptions implements OnChanges {
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

  @Input() type: PostActionType = 'focusAndZoom';
  @Input() data?:
    | ZoomAndFocusOptions
    | (AutoTrackingOptions & {
        nodeId: string;
        deviceId: string;
        presetId: number;
      });
  @Output() exit = new EventEmitter();
  @Output() save = new EventEmitter<
    ZoomAndFocusOptions | AutoTrackingOptions
  >();

  private _zoomAndFocusFormGroup = new FormGroup({
    zoomInLevel: new FormControl<number>(1, [Validators.required]),
    trackingDuration: new FormControl<number>(2, [
      Validators.min(1),
      Validators.max(10),
      Validators.required,
    ]),
  });
  private _autoTrackingFormGroup = new FormGroup({
    pan: new FormControl<number>(3, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    tilt: new FormControl<number>(3, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    waitingTime: new FormControl<number>(5, [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    zoomInLevel: new FormControl<number>(1, [Validators.required]),
    trackingDuration: new FormControl<number>(30, [
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
    nodeId: new FormControl<string>('', [Validators.required]),
    deviceId: new FormControl<string>('', [Validators.required]),
    presetId: new FormControl<number>(0, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  get formGroup() {
    return this.type === 'focusAndZoom'
      ? this._zoomAndFocusFormGroup
      : this._autoTrackingFormGroup;
  }

  get canSubmit() {
    return this.formGroup.valid;
  }

  get boundingBoxEditorSrc(): {
    nodeId?: string | null;
    deviceId?: string | null;
    presetId?: number | null;
  } {
    const { nodeId, deviceId, presetId } = this._autoTrackingFormGroup.value;
    return { nodeId, deviceId, presetId };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      Object.entries(changes['data'].currentValue).forEach(([key, value]) => {
        this._zoomAndFocusFormGroup.get(key)?.reset(value);
        this._autoTrackingFormGroup.get(key)?.reset(value);
      });
    }
  }

  onSaveClicked() {
    const data =
      this.type === 'focusAndZoom'
        ? (Object.assign(
            {},
            this._zoomAndFocusFormGroup.value
          ) as ZoomAndFocusOptions)
        : (Object.assign({}, this._autoTrackingFormGroup.value, {
            nodeId: undefined,
            deviceId: undefined,
            presetId: undefined,
          }) as AutoTrackingOptions);
    this.save.emit(data);
  }
}
