import { Component } from '@angular/core';
import { ControlValueAccessorImpl } from '@shared/helpers/control-value-accessor-impl';

@Component({
  selector: 'password-input',
  templateUrl: 'password-input.component.html',
  styleUrls: ['password-input.component.scss'],
})
export class PasswordInputComponent extends ControlValueAccessorImpl<string> {
  showPassword: boolean = false;
}
