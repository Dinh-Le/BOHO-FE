import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { SelectItemModel } from '@shared/models/select-item-model';
import { SharedModule } from '@shared/shared.module';

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
export class PresetSelectDialogComponent {
  presets: SelectItemModel[] = [];
  activeModal = inject(NgbActiveModal);
  form = new FormGroup({
    preset: new FormControl<SelectItemModel | null>(null, [
      Validators.required,
    ]),
    standTime: new FormControl<number>(1, [Validators.required]),
    movingTime: new FormControl<number>(1, [Validators.required]),
  });

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close(this.form.value);
  }
}
