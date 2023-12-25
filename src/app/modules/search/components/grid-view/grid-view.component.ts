import { Component, Input } from '@angular/core';
import { EventInfo } from 'src/app/data/schema/event-info';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css'],
})
export class GridViewComponent {
  @Input()
  cols: string = '3';

  @Input()
  events: any[] = [];

  get gridTemplateColumns() {
    return `repeat(${this.cols}, 1fr)`;
  }
}
