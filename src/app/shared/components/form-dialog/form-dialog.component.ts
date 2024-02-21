import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-dialog',
  templateUrl: 'form-dialog.component.html',
  styleUrls: [
    'form-dialog.component.scss',
    '../../../modules/manage/shared/my-input.scss',
  ],
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

  @Input() backgroundColor: string = '#595959';

  @Output()
  cancel = new EventEmitter();

  @Output()
  submit = new EventEmitter();
}
