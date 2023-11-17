import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

@Component({
  selector: 'app-form-dialog',
  templateUrl: 'form-dialog.component.html',
  styleUrls: ['form-dialog.component.scss', '../shared/my-input.scss'],
  standalone: true,
})
export class FormDialogComponent {
  @Input()
  title = '';

  @Input()
  submitTitle = 'Lưu';

  @Input()
  cancelTitle = 'Hủy';

  @Input()
  canSubmit = true;

  @Output()
  cancel = new EventEmitter();

  @Output()
  submit = new EventEmitter();
}
