import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { EventService } from 'src/app/data/service/event.service';
import { SearchEvent } from 'src/app/data/service/search.service';
import * as Leaflet from 'leaflet';
import { PresetService } from 'src/app/data/service/preset.service';
import { Preset } from 'src/app/data/schema/boho-v2/preset';
import { RuleService } from 'src/app/data/service/rule.service';
import { NavigationService } from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-event-detail-dialog',
  templateUrl: 'event-detail.component.html',
  styleUrls: ['event-detail.component.scss'],
  standalone: true,
  imports: [SharedModule, NgbModalModule, CommonModule],
})
export class EventDetailComponent implements OnInit {
  @Input() type: 'location' | 'image' = 'image';
  @Input() showPresetInfo: boolean = false;

  event!: SearchEvent;
  index: number = 0;
  preset$!: Observable<Preset | undefined>;

  constructor(
    private activeModal: NgbActiveModal,
    private eventService: EventService,
    private toastService: ToastService,
    private presetService: PresetService,
    private ruleService: RuleService
  ) {}

  get length(): number {
    return this.event?.images_info?.length ?? 0;
  }

  get image() {
    if (this.length === 0) {
      return null;
    }

    return this.event.images_info[this.index];
  }

  get percentage() {
    if (this.length === 0) {
      return '100%';
    }

    return (100 * (this.index + 1)) / this.length + '%';
  }

  get title(): string {
    return this.type === 'image' ? 'Chi tiết sự kiện' : 'Địa điểm sự kiện';
  }

  get locationData(): Leaflet.LatLng[] {
    const { lat, long } = this.event.device_location;
    const location = Leaflet.latLng(parseFloat(lat), parseFloat(long));
    return [location];
  }

  ngOnInit(): void {
    this.preset$ = this.ruleService
      .find(this.event.node_id, this.event.device_id, this.event.rule_id)
      .pipe(
        switchMap(({ data }) =>
          this.presetService
            .findAll(this.event.node_id, this.event.device_id)
            .pipe(
              switchMap(({ data: presets }) =>
                of(
                  presets.find(
                    (preset) => preset.id === (data as any).data.preset_id
                  )
                )
              )
            )
        ),
        catchError((err: HttpErrorResponse) => {
          this.toastService.showError(
            `Fetch preset info failed with error ${
              err.error?.message ?? err.message
            }`
          );
          return of(undefined);
        })
      );
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

  verify(button: HTMLButtonElement, value: boolean) {
    this.eventService
      .verify(this.event.node_id, this.event.device_id, this.event.event_id, {
        is_verify: value,
      })
      .pipe(
        tap(() => (button.disabled = true)),
        finalize(() => (button.disabled = false))
      )
      .subscribe({
        error: (err: HttpErrorResponse) =>
          this.toastService.showError(err.error?.message ?? err.message),
        complete: () => {
          this.toastService.showSuccess('Update event successfully');
          this.event.is_verify = value;
        },
      });
  }
}
