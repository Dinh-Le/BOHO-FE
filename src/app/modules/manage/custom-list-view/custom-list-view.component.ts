import { Component, Input, forwardRef } from '@angular/core';
import { CustomListViewItem } from './custom-list-view-item';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-list-view',
  templateUrl: 'custom-list-view.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomListViewComponent),
      multi: true,
    },
  ],
})
export class CustomListViewComponent implements ControlValueAccessor {
  items: CustomListViewItem[] = [];

  onChanged: any;

  trackByValue(_: number, item: CustomListViewItem) {
    return item.value;
  }

  remove(item: CustomListViewItem) {
    this.items = this.items.filter((e) => e.value !== item.value);
    if (this.onChanged) {
      this.onChanged(this.items);
    }
  }

  writeValue(value: CustomListViewItem[]): void {
    this.items = value;
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}
}
