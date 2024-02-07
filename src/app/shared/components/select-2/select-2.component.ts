import {
  Component,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectItemModel } from '@shared/models/select-item-model';

@Component({
  selector: 'app-select-2',
  templateUrl: 'select-2.component.html',
  styleUrls: ['select-2.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select2Component),
      multi: true,
    },
  ],
})
export class Select2Component implements ControlValueAccessor {
  @Input()
  contentTemplateRef!: TemplateRef<any>;

  @Input()
  menuItemClassName: string = '';

  @Input()
  menuItemTemplateRef!: TemplateRef<any>;

  @Input({
    transform: (items: SelectItemModel[]) =>
      items.map((it) => Object.assign({}, it, { selected: false })),
  })
  items: SelectItemModel[] = [];

  @Input()
  multiple: boolean = false;

  @Input()
  placeHolder: string = 'Select item...';

  @Input() styles: any = {};

  menuVisible: boolean = false;

  currentItems: SelectItemModel[] = [];

  onChange = (_: SelectItemModel) => {};

  onTouched = () => {};

  private eRef = inject(ElementRef);

  trackByItems(_: number, item: SelectItemModel): any {
    return item.value;
  }

  get model(): any {
    return this.multiple ? this.currentItems : this.currentItems[0];
  }

  set model(newValues: SelectItemModel[]) {
    if (this.currentItems.length === newValues.length) {
      let changed = false;

      for (const currentValue of this.currentItems) {
        if (!newValues.find((e) => e.value == currentValue.value)) {
          changed = true;
          break;
        }
      }

      if (!changed) {
        return;
      }
    }

    this.items.forEach((e) => (e.selected = false));
    this.currentItems = this.items.filter((e) =>
      newValues.some(({ value }) => e.value === value)
    );
    this.currentItems.forEach((e) => (e.selected = true));
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
        this.currentItems.push(item);
      } else {
        const index = this.currentItems.findIndex(
          (e) => e.value === item.value
        );
        if (index !== -1) {
          this.currentItems.splice(index, 1);
        }
      }

      this.onChange(this.model);
    } else {
      this.model = [item];
      this.menuVisible = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuVisible = false;
    }
  }
}
