import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template:
    '<div class="d-flex justify-content-center mt-5" [class]="colorClass"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>',
})
export class LoadingComponent {
  @Input() colorClass = '';
}
