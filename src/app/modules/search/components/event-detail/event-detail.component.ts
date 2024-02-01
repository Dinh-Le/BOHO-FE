import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
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
  index: number = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  get length() {
    return this.event?.images_info?.length ?? 0;
  }

  get image() {
    if (this.length === 0) {
      return null;
    }

    return this.event?.images_info[this.index];
  }

  get percentage() {
    if (this.length === 0) {
      return '100%';
    }

    return (100 * (this.index + 1)) / this.length + '%';
  }

  close() {
    this.activeModal.dismiss();
  }

  next() {
    if (this.index < this.length - 1) {
      this.index += 1;
    }
  }

  previous() {
    if (this.index > 0) {
      this.index -= 1;
    }
  }

  first() {
    this.index = 0;
  }

  last() {
    this.index = this.length - 1;
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
      .subscribe({
        error: (err: HttpErrorResponse) =>
          this.toastService.showError(err.error?.message ?? err.message),
        complete: () => {
          this.toastService.showSuccess('Successfully');
          this.activeModal.close();
          button.disabled = false;
        },
      });
  }
}
