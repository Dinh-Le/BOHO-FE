import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueAccessorImpl } from '@shared/helpers/control-value-accessor-impl';

@Component({
  selector: 'app-numeric-input',
  templateUrl: 'numeric-input.component.html',
  styleUrls: ['numeric-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericInputComponent),
      multi: true,
    },
  ],
})
export class NumericInputComponent
  extends ControlValueAccessorImpl<number>
  implements OnInit
{
  @Input() min: number = Number.MIN_VALUE;
  @Input() max: number = Number.MAX_VALUE;
  @Input() step: number = 1;
  @Input() unit: string = '';

  protected override _model: number = 0;

  private _allowChars: string = '1234567890';

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.model = 0;
  }

  up() {
    if (this.model < this.max) {
      this.model += this.step;
    }
  }

  down() {
    if (this.model > this.min) {
      this.model -= this.step;
    }
  }

  override get model(): number {
    return this._model;
  }

  override set model(value: any) {
    if (typeof value === 'string') {
      value = parseInt(value);
      if (Number.isNaN(value)) {
        value = this.min;
      }
    }

    value = Math.max(this.min, Math.min(value, this.max));

    if (this._model === value) {
      return;
    }

    this._model = value;
    this._onChange(this.model);
  }

  onChange(event: Event, input: HTMLInputElement) {
    if (input.value !== this.model.toString()) {
      input.value = this.model.toString();
    }
  }

  onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === 'ArrowUp') {
      this.up();
      return true;
    }

    if (event.key === 'ArrowDown') {
      this.down();
      return true;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return true;
    }

    const inputEl = event.target as HTMLInputElement;
    if (inputEl.selectionStart == 0 && event.key == '-') {
      return true;
    }

    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      this._allowChars.includes(event.key)
    ) {
      return true;
    }

    return false;
  }
}
