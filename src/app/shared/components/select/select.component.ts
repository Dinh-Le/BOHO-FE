import { Component, Input, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';


@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input()
  dropdownItemTemplate: TemplateRef<any> | undefined;

  @Input()
  dropdownToggleContentTemplate: TemplateRef<any> | undefined;

  @Input()
  items: SelectItemModel[] = [];

  @Input()
  label: string = '';

  @Input()
  multiple: boolean = false;

  @Input()
  activeClass: string = 'btn-primary';

  @Input()
  deactiveClass: string = 'btn-outline-primary';

  currentValues: SelectItemModel[] = [];

  onChange = (_: any) => { };

  onTouched = () => { };

  trackByItems(index: number, item: SelectItemModel): any { return item.value; }

  get titleClasses(): string {
    return this.currentValues.length ? this.activeClass : this.deactiveClass;
  }

  get model(): any {
    return this.multiple ? this.currentValues : this.currentValues[0];
  }

  set model(newValues: any[]) {
    if (this.currentValues.length === newValues.length) {
      let changed = false;

      for (const currentValue of this.currentValues) {
        if (!newValues.find(e => e.value == currentValue.value)) {
          changed = true;
          break;
        }
      }

      if (!changed) {
        return;
      }
    }
    
    this.currentValues.forEach(e => e.selected = false);
    newValues.forEach(e => e.selected = true);
    this.currentValues = newValues;

    this.onChange(this.model);
  }

  writeValue(value: any): void {    
    if (!value) {
      this.model = [];
    } else if (!Array.isArray(value)) {
      this.model = [value];
    } else {
      this.model = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  selectItem(item: SelectItemModel) {
    if (!this.multiple && item.selected) {
      return;
    } 
    
    if (this.multiple) {
      item.selected = !item.selected;

      if (item.selected) {
        this.currentValues.push(item);
      } else {      
        const index = this.currentValues.findIndex(e => e.value === item.value);
        if (index !== -1) {
          this.currentValues.splice(index, 1);
        }

        this.onChange(this.model);
      }      
    } else {
      this.model = [item];
    }
  }
}
