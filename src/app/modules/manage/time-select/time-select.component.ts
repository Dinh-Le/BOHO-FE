import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-time-select',
  templateUrl: 'time-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeSelectComponent),
      multi: true,
    },
  ],
})
export class TimeSelectComponent implements ControlValueAccessor {
  currentValue: Date = new Date();
  isDisabled: boolean = false;
  onChange: any;
  onTouched: any;

  get hour(): string {
    return this.model.getHours().toString().padStart(2, '0');
  }

  get minute(): string {
    return this.model.getMinutes().toString().padStart(2, '0');
  }

  get model(): Date {
    return this.currentValue;
  }

  set model(value: Date) {
    if (value && this.currentValue !== value) {
      this.currentValue = value;
      if (this.onChange) {
        this.onChange(this.currentValue);
      }
    }
  }

  increase(amount: any, unit: any) {
    this.model = moment(this.currentValue).add(amount, unit).toDate();
  }

  decrease(amount: any, unit: any) {
    this.model = moment(this.currentValue).subtract(amount, unit).toDate();
  }

  writeValue(value: Date): void {
    this.model = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
