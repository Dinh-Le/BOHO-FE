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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';

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
  @Input() data?: ZoomAndFocusOptions | AutoTrackingOptions;
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
  });

  get formGroup() {
    return this.type === 'focusAndZoom'
      ? this._zoomAndFocusFormGroup
      : this._autoTrackingFormGroup;
  }

  get canSubmit() {
    return this.formGroup.valid;
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
        ? (this._zoomAndFocusFormGroup.value as ZoomAndFocusOptions)
        : (this._autoTrackingFormGroup.value as AutoTrackingOptions);
    this.save.emit(data);
  }
}
