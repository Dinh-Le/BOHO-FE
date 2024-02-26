import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Level3Menu,
  NavigationService,
} from 'src/app/data/service/navigation.service';

@Component({
  selector: 'app-camera-settings',
  templateUrl: 'camera-settings.component.html',
  styleUrls: ['camera-settings.component.scss'],
  host: {
    class: 'flex-grow-1 d-flex flex-column my-bg-default px-5 pb-5 pt-1',
  },
})
export class CameraSettingsComponent implements OnInit {
  form = new FormGroup({
    enabled: new FormControl<boolean>(true, [Validators.required]),
    duration: new FormControl<number>(5, [Validators.required]),
    threshold: new FormControl<number>(30, [Validators.required]),
  });

  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.navigationService.level3 = Level3Menu.GENERAL_SETTINGS;
  }

  submit() {}

  reset() {
    this.form.reset({
      enabled: true,
      duration: 5,
      threshold: 30,
    });
  }
}
