import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormDialogComponent } from '@modules/manage/form-dialog/form-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-group-node',
  templateUrl: 'add-group-node.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, FormDialogComponent],
})
export class AddGroupNodeComponent {
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
