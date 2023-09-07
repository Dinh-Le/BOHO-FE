import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input()
  total: number = 0;

  first() {}

  previous() {}

  selectPage() {}

  next() {}

  last() {}
}
