import { Component, inject } from '@angular/core';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: 'event-detail.component.html',
  styleUrls: ['event-detail.component.scss'],
  standalone: true,
  imports: [SharedModule, NgbModalModule],
})
export class EventDetailComponent {
  private _activeModal = inject(NgbActiveModal);

  close() {
    this._activeModal.dismiss();
  }
}
