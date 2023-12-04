import { ControlValueAccessor } from '@angular/forms';

export class ControlValueAccessorImpl<T> implements ControlValueAccessor {
  protected _model!: T;
  protected _onChange: (_: T) => void = (_) => {};

  get model(): T {
    return this._model;
  }

  set model(value: T) {
    if (this.areEqual(this.model, value)) {
      return;
    }

    this._model = value;
    this._onChange(this.model);
  }

  writeValue(value: T): void {
    this.model = value;
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}

  areEqual(x: T, y: T): boolean {
    return x == y;
  }
}
