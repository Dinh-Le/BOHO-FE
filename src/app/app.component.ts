import { Component } from '@angular/core';
import { ToastInfo, ToastService } from '@app/services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'BOHO';

  constructor(private toastService: ToastService) {}

  get toasts(): ToastInfo[] {
    return this.toastService.toasts;
  }

  removeToast(toast: ToastInfo) {
    this.toastService.remove(toast);
  }
}
