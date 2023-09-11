import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input()
  totalItems: number = 0;

  @Input()
  totalPages: number = 0;

  @Input()
  windowSize: number = 5;

  currentPage: number = 1;

  @Output()
  changed = new EventEmitter<number>();

  get halfWindowSize(): number {
    return Math.floor(this.windowSize / 2);
  }

  get pages(): number[] {
    if (this.totalPages <= this.windowSize) {
      return Array(this.totalPages)
        .fill(0)
        .map((_, index) => index);
    }

    let start = Math.min(
      Math.max(1, this.currentPage - this.halfWindowSize),
      this.totalPages - this.windowSize
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
    this.currentPage = Math.min(this.totalPages - 1, this.currentPage + 1);
  }

  last() {
    this.currentPage = this.totalPages - 1;
  }
}
