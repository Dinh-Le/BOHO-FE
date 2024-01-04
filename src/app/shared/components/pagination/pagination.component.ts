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
  readonly WINDOW_SIZE: number = 5;

  @Input()
  totalItems: number = 0;

  onChange: any;
  onTouched: any;
  isDisabled: boolean = false;
  pageLengthList: number[] = [25, 50, 100];

  private _data: {
    pageIndex: number;
    pageLength: number;
  } = {
    pageIndex: 1,
    pageLength: 25,
  };

  get currentPage(): number {
    return this._data.pageIndex;
  }

  set currentPage(value: number) {
    if (value !== this._data.pageIndex) {
      this._data.pageIndex = value;
      if (this.onChange) {
        this.onChange({ ...this._data });
      }
    }
  }

  get pageLength() {
    return this._data.pageLength;
  }

  set pageLength(value: number) {
    if (value !== this._data.pageLength) {
      this._data.pageLength = value;
      if (this.onChange) {
        this.onChange({ ...this._data });
      }
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this._data.pageLength);
  }

  get halfWindowSize(): number {
    return Math.floor(this.WINDOW_SIZE / 2);
  }

  get pages(): number[] {
    if (this.totalPages <= this.WINDOW_SIZE) {
      return Array(this.totalPages)
        .fill(0)
        .map((_, index) => index + 1);
    }

    let start = Math.min(
      Math.max(1, this.currentPage - this.halfWindowSize),
      this.totalPages - this.WINDOW_SIZE + 1
    );

    return Array(this.WINDOW_SIZE)
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

  writeValue(
    data: Partial<{ pageIndex: number; pageLength: number } | null>
  ): void {
    if (data?.pageIndex) {
      this.currentPage = data.pageIndex;
    }

    if (data?.pageLength) {
      this.pageLength = data.pageLength;
    }
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
