import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '@app/services/loading.service';
import { finalize, tap } from 'rxjs';
import { UserService } from 'src/app/data/service/user.service';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
})
export class AuthLayoutComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({
    username: new FormControl('root', [Validators.required]),
    password: new FormControl('Goback@2021', [Validators.required]),
  });

  constructor(
    private router: Router,
    private userService: UserService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {}

  submit() {
    this.userService
      .login({
        name: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value,
      })
      .subscribe(
        () => {
          this.router.navigateByUrl('/search');
        },
        (errors) => {
          alert(errors?.error.message);
        }
      );
  }
}
