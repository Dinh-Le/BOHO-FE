import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select-3',
  templateUrl: 'select-3.component.html',
  styleUrls: ['select-3.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select3Component),
      multi: true,
    },
  ],
})
export class Select3Component implements ControlValueAccessor, OnChanges {
  _el: ElementRef = inject(ElementRef);
  _onChange: any;
  _onTouched: any;
  _subscriber: Function[] = [];
  _dropdownVisible = false;
  _selectedValues: any[] = [];
  _options: SelectOption[] = [];

  @Input('template') template?: TemplateRef<any>;
  @Input() disabled: boolean = false;
  @Input('place-holder') placeHolder: string = 'Select option';
  @Input() multiple: boolean = false;
  @Input('popper-class') popperClass: string = '';

  @Input() get model(): any {
    if (this.multiple) {
      return this._selectedValues;
    }

    return this._selectedValues.length > 0 ? this._selectedValues[0] : null;
  }
  set model(value: any) {
    if (!value) {
      value = [];
    } else if (!Array.isArray(value)) {
      value = [value];
    }

    if (
      value.length === this._selectedValues.length &&
      value.every((x: any) => this._selectedValues.includes(x))
    ) {
      return;
    }

    this._selectedValues = [...value];
    this._onChange?.(this.model);
    this.modelChange.emit(this.model);
    this.notifyAll();
  }
  @Output() modelChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() open: EventEmitter<any> = new EventEmitter<any>();

  get dropdownVisible(): boolean {
    return this._dropdownVisible;
  }

  get labels(): string[] {
    return this._options
      .filter((option) => this._selectedValues.includes(option.value))
      .map((option) => option.label);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes || !changes['model'] || changes['model'].isFirstChange()) {
      return;
    }

    if (changes['model'].currentValue) {
      this.model = changes['model'].currentValue;
    }
  }

  writeValue(value: any): void {
    this.model = value;
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  appendOption({ value, label }: any) {
    this._options.push({ value, label });
  }

  subscribe(fn: Function): void {
    this._subscriber.push(fn);
  }

  onItemSelectionChanged(item: any, selected: boolean): void {
    if (this.multiple) {
      if (selected) {
        this.model = [...this.model, item];
      } else {
        this.model = this.model.filter((e: any) => e !== item);
      }
    } else {
      if (selected) {
        this.model = item;
      } else {
        this.model = null;
      }
    }
  }

  private notifyAll(): void {
    this._subscriber.forEach((fn) => fn());
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    if (!target) {
      return;
    }

    if (!this._el.nativeElement.contains(target)) {
      this._dropdownVisible = false;
    }
  }

  onClick(event: MouseEvent) {
    if (!this._dropdownVisible) {
      this.open.emit();
    }
    this._dropdownVisible = true;
  }
}
