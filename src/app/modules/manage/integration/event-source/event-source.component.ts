import { Component, inject } from '@angular/core';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-event-source',
  templateUrl: 'event-source.component.html',
  styleUrls: ['event-source.component.scss', '../../shared/my-input.scss'],
  standalone: true,
  imports: [FormDialogComponent],
})
export class EventSourceComponent {
  _activeModel = inject(NgbActiveModal);

  cancel() {
    this._activeModel.dismiss();
  }

  submit() {
    this._activeModel.close();
  }
}
