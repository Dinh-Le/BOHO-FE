import { Component, OnInit, inject } from '@angular/core';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'BOHO';
  toastService = inject(ToastService);

  ngOnInit(): void {
    this.toastService.showInfo('Good morning!');
  }
}
