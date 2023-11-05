import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-vehicle-list',
  templateUrl: 'add-vehicle-list.component.html',
  styleUrls: ['../../shared/my-input.scss', '../../shared/my-modal.scss'],
  standalone: true,
  imports: [NgbModalModule, FormsModule, ReactiveFormsModule],
})
export class AddVehicleListComponent {
  activeModal = inject(NgbActiveModal);

  title: string = 'Thêm danh sách biển số';
  submitButtonTitle: string = 'Lưu';
  cancelButtonTitle: string = 'Hủy';

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('black-list', [Validators.required]),
  });

  set name(value: string) {
    this.form.get('name')?.setValue(value);
  }

  set type(value: string) {
    this.form.get('type')?.setValue(value);
  }

  canSubmit() {
    return this.form.valid;
  }

  close() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close({
      data: this.form.value,
    });
  }
}
