import { ControlValueAccessor } from '@angular/forms';

export class ControlValueAccessorImpl<T> implements ControlValueAccessor {
  private _model: Array<T> = [];
  private _onChange: (_: Array<T>) => void = (_) => {};

  get model(): Array<T> {
    return this._model;
  }

  set model(value: Array<T>) {
    if (
      value.length === this._model.length &&
      value.every((e) => this._model.some((x) => this.areEqual(x, e)))
    ) {
      return;
    }

    this._model = value;
    this._onChange(this.model);
  }

  writeValue(value: Array<T>): void {
    this.model = value || [];
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
