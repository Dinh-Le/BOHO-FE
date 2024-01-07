import { Component, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { finalize } from 'rxjs';
import { EventService } from 'src/app/data/service/event.service';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: 'event-detail.component.html',
  styleUrls: ['event-detail.component.scss'],
  standalone: true,
  imports: [SharedModule, NgbModalModule],
})
export class EventDetailComponent {
  event: any;

  constructor(
    private activeModal: NgbActiveModal,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  close() {
    this.activeModal.dismiss();
  }

  verify(ev: Event, value: boolean) {
    if (this.event.is_verify === value) {
      return;
    }

    const button = ev.target as HTMLButtonElement;
    button.disabled = true;

    this.eventService
      .verify(
        this.event.node_id,
        this.event.device_id,
        this.event.images_info[0].detection_id,
        {
          is_verify: value,
        }
      )
      .pipe(finalize(() => (button.disabled = false)))
      .subscribe({
        error: ({ message }) => this.toastService.showError(message),
        complete: () => {
          this.toastService.showSuccess('Successfully');
          this.activeModal.close();
        },
      });
  }
}
