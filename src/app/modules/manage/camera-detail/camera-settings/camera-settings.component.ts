import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-camera-settings',
  templateUrl: 'camera-settings.component.html',
  styleUrls: ['camera-settings.component.scss'],
})
export class CameraSettingsComponent {
  form = new FormGroup({
    enabled: new FormControl<boolean>(true, [Validators.required]),
    duration: new FormControl<number>(5, [Validators.required]),
    threshold: new FormControl<number>(30, [Validators.required]),
  });

  submit() {}

  reset() {
    this.form.reset({
      enabled: true,
      duration: 5,
      threshold: 30,
    });
  }
}
