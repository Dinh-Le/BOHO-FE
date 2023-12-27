import { Component, Input, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { v4 } from 'uuid';
import { EventDetailComponent } from '../event-detail/event-detail.component';

@Component({
  selector: 'app-grid-view',
  templateUrl: 'grid-view.component.html',
  styleUrls: ['grid-view.component.scss'],
})
export class GridViewComponent implements OnInit {
  private _modalService = inject(NgbModal);

  @Input()
  cols: string = '3';

  events: any[] = [];

  ngOnInit(): void {
    this.events = Array(10)
      .fill('/assets/images/car.png')
      .map((e, index) => ({
        id: v4(),
        thumbnailUrl: e,
        imageUrl: e,
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
  }

  get gridTemplateColumns() {
    return `repeat(${this.cols}, 1fr)`;
  }

  showEventDetail() {
    this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
  }
}
