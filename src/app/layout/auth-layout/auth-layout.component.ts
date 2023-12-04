import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@app/services/toast.service';
import { catchError, of, switchMap } from 'rxjs';
import { UserService } from 'src/app/data/service/user.service';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
})
export class AuthLayoutComponent implements OnInit {
  private _router = inject(Router);
  private _userService = inject(UserService);
  private _toastService = inject(ToastService);

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('root', [Validators.required]),
    password: new FormControl('Goback@2021', [Validators.required]),
  });

  ngOnInit(): void {}

  submit() {
    this._userService
      .login({
        name: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value,
      })
      .pipe(
        switchMap((response) => {
          if (!response.success) {
            throw Error(response.message);
          }

          return this._userService.findAll();
        }),
        catchError((error) => {
          this._toastService.showError(error);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response?.success) {
          this._userService.currentUser = response.data;
          console.log(this._userService.currentUser);
          this._router.navigateByUrl('/search');
        }
      });
  }
}
