import { Component, Input } from '@angular/core';
import { v4 } from 'uuid';

@Component({
  selector: 'app-list-view-search',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent {
  events: any[] = Array(10)
    .fill('/assets/images/car.png')
    .map((e, index) => ({
      id: v4(),
      imgUrl: e,
      licencePlate: '65G8944' + index.toString(),
      model: 'Camry',
      manufacturer: 'Toyota',
      color: 'Xanh',
      ruleType: 'Đỗ xe sai quy định',
      address: 'Số 23 Đường số 10, Linh Chiểu, Thủ Đức',
      object: 'car',
      datetime: '10:25:30 16-11-2023',
      seen: false,
    }));
  selectedEvent?: any;

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
