import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaginationComponent),
      multi: true,
    },
  ],
})
export class PaginationComponent implements ControlValueAccessor {
  @Input()
  totalItems: number = 0;

  @Input()
  pageLength: number = 20; // the number items per page

  @Input()
  windowSize: number = 5;

  onChange: any;
  onTouched: any;
  isDisabled: boolean = false;

  private _currentPage: number = 1;

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    if (value !== this._currentPage) {
      this._currentPage = value;
      if (this.onChange) {
        this.onChange(this._currentPage);
      }
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageLength);
  }

  get halfWindowSize(): number {
    return Math.floor(this.windowSize / 2);
  }

  get pages(): number[] {
    if (this.totalPages <= this.windowSize) {
      return Array(this.totalPages)
        .fill(0)
        .map((_, index) => index + 1);
    }

    let start = Math.min(
      Math.max(1, this.currentPage - this.halfWindowSize),
      this.totalPages - this.windowSize + 1
    );

    return Array(this.windowSize)
      .fill(start)
      .map((base, index) => base + index);
  }

  first() {
    this.currentPage = 1;
  }

  previous() {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  selectPage(page: number) {
    this.currentPage = page;
  }

  next() {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  last() {
    this.currentPage = this.totalPages;
  }

  writeValue(value: number): void {
    this.currentPage = value;
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
