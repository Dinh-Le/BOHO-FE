import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
export class TimeInputComponent implements ControlValueAccessor {
  currentValue: number = 0;

  onChanged: any;
  onTouch: any;

  get model() {
    return this.currentValue;
  }

  set model(value: number) {
    this.currentValue = Math.max(0, Math.min(value, 1440));
    if (this.onChanged) {
      this.onChanged(this.currentValue);
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

  writeValue(value: number): void {
    this.model = value;
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}
}
