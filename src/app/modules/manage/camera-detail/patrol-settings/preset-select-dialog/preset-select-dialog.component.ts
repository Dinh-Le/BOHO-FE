import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { SharedModule } from '@shared/shared.module';
import { of, switchMap } from 'rxjs';
import { PresetService } from 'src/app/data/service/preset.service';

@Component({
  selector: 'app-preset-select-dialog',
  templateUrl: 'preset-select-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormDialogComponent,
    SharedModule,
  ],
})
export class PresetSelectDialogComponent implements OnInit {
  presets: SelectItemModel[] = [];
  activeModal = inject(NgbActiveModal);
  presetService = inject(PresetService);
  toastService = inject(ToastService);
  activatedRoute = inject(ActivatedRoute);
  form = new FormGroup({
    presets: new FormControl<SelectItemModel[]>([], [Validators.required]),
  });
  nodeId: string = '';
  deviceId: string = '';

  ngOnInit(): void {
    this.presetService
      .findAll(this.nodeId, this.deviceId)
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(`Fetch presets failed with error: ${response.message}`);
          }

          return of(response.data);
        })
      )
      .subscribe({
        next: (presets) => {
          this.presets = presets.map((e) => ({
            value: e.id,
            label: e.name,
          }));
        },
        error: ({ message }) => this.toastService.showError(message),
      });
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close(this.form.value);
  }
}
