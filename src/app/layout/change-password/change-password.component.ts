import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JWTTokenService } from '@app/services/jwt-token.service';
import { ToastService } from '@app/services/toast.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { SharedModule } from '@shared/shared.module';
import { finalize } from 'rxjs';
import { UserService } from 'src/app/data/service/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: 'change-password.component.html',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FormDialogComponent,
  ],
})
export class ChangePasswordComponent {
  password = new FormControl<string>('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  constructor(
    private userService: UserService,
    private tokenService: JWTTokenService,
    private toastService: ToastService,
    private modalService: NgbActiveModal
  ) {}

  submit() {
    this.userService
      .updatePassword(this.tokenService.userId, this.password.value ?? '')
      .subscribe({
        complete: () => {
          this.toastService.showSuccess('Update password successfuly');
          this.modalService.close();
        },
        error: (err: HttpErrorResponse) =>
          this.toastService.showError(
            `Update password failed with error: ${
              err.error?.message ?? err.message
            }`
          ),
      });
  }

  cancel() {
    this.modalService.dismiss();
  }
}
