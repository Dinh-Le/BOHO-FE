import { Component, Input, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventDetailComponent } from '../event-detail/event-detail.component';

@Component({
  selector: 'app-grid-view',
  templateUrl: 'grid-view.component.html',
  styleUrls: ['grid-view.component.scss'],
})
export class GridViewComponent implements OnInit {
  private _modalService = inject(NgbModal);

  @Input() cols: number = 3;
  @Input() events: any[] = [];
  @Input() pageLength: number = 50;

  ngOnInit(): void {}

  get gridTemplateColumns() {
    return `repeat(${this.cols}, 1fr)`;
  }

  showEventDetail(index: number) {
    const modalRef = this._modalService.open(EventDetailComponent, {
      size: 'xl',
    });
    const component = modalRef.componentInstance as EventDetailComponent;
    component.event = this.events[index];
  }

  get count(): number {
    const numRow = Math.ceil(this.pageLength / this.cols);
    return numRow * this.cols;
  }
}
