import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { EventData } from '@modules/search/models';

@Component({
  selector: 'app-list-view-search',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements OnChanges {
  @Input() events: EventData[] = [];
  @Output() onClick = new EventEmitter<EventData>();
  @Output() onChange = new EventEmitter<EventData>();

  currentEvent?: EventData;

  get address(): string {
    return this.currentEvent?.address ?? '';
  }

  get licensePlate(): string {
    return (
      this.currentEvent?.data.images_info[0].recognize_result?.lisence_plate ??
      ''
    );
  }

  get model(): string {
    return this.currentEvent?.data.images_info[0].recognize_result?.model ?? '';
  }

  get color(): string {
    return this.currentEvent?.data.images_info[0].recognize_result?.color ?? '';
  }

  get alarmType(): string {
    return this.currentEvent?.data.alarm_type ?? '';
  }

  get detectionTime(): string {
    return this.currentEvent?.data.images_info[0].detection_time ?? '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('events' in changes) {
      if (this.events.length > 0) {
        this.currentEvent = this.events[0];
      } else {
        this.currentEvent = undefined;
      }
    }
  }
}
