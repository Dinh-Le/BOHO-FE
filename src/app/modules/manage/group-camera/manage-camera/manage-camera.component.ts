import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormDialogComponent } from '@modules/manage/form-dialog/form-dialog.component';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-manage-camera',
  templateUrl: 'manage-camera.component.html',
  styleUrls: ['manage-camera.component.scss'],
  standalone: true,
  imports: [FormDialogComponent],
})
export class ManageCameraComponent {
  activeModal = inject(NgbActiveModal);
  id!: string;
  name!: string;

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close();
  }
}
