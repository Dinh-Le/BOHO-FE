import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-list-view-search',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent {
  @Input() events: any[] = [];

  selectedEvent: any;

  get address() {
    return this.selectedEvent
      ? `${this.selectedEvent.device_location.lat}, ${this.selectedEvent.device_location.long}`
      : '';
  }

  public getEventInfoBackgroundClass(level?: string): string {
    if (level === 'medium') {
      return 'bg-primary';
    } else if (level === 'high') {
      return 'bg-danger';
    } else {
      return 'bg-secondary';
    }
  }
}
