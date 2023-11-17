import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormDialogComponent } from '@modules/manage/form-dialog/form-dialog.component';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-group-camera',
  templateUrl: 'add-group-camera.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, FormDialogComponent],
})
export class AddGroupCameraComponent {
  activeModal = inject(NgbActiveModal);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close(this.form.value);
  }
}
