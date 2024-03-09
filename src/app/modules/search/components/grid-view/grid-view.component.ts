import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SearchEvent } from 'src/app/data/service/search.service';
import { EventData } from '@modules/search/models';

@Component({
  selector: 'app-grid-view',
  templateUrl: 'grid-view.component.html',
  styleUrls: ['grid-view.component.scss'],
})
export class GridViewComponent {
  @Input() col: number = 5;
  @Input() row: number = 10;
  @Input() events: EventData[] = [];
  @Output() onChange = new EventEmitter<EventData>();
  @Output() onClick = new EventEmitter<EventData>();

  get gridTemplateColumns() {
    return `repeat(${this.col}, 1fr)`;
  }

  trackByDetectionId(_: number, item: SearchEvent) {
    return item.images_info[0].detection_id;
  }
}
