import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueAccessorImpl } from '@shared/helpers/control-value-accessor-impl';

@Component({
  selector: 'app-time-input',
  templateUrl: 'time-input.component.html',
  styleUrls: ['time-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeInputComponent),
      multi: true,
    },
  ],
})
export class TimeInputComponent extends ControlValueAccessorImpl<number> {
  currentValue: number = 0;

  override get model() {
    return this.currentValue;
  }

  override set model(value: number) {
    this.currentValue = Math.max(0, Math.min(value, 1440));
    if (this._onChange) {
      this._onChange(this.currentValue);
    }
  }

  get minute() {
    return String(this.model % 60).padStart(2, '0');
  }

  set minute(value: string) {
    if (!value) value = '00';

    this.model = Number.parseInt(this.hour) * 60 + Number.parseInt(value);
  }

  get hour() {
    return String(Math.floor(this.model / 60)).padStart(2, '0');
  }

  set hour(value: any) {
    if (!value) value = '00';
    this.model = Number.parseInt(value) * 60 + Number.parseInt(this.minute);
  }
}
