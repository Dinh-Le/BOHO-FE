import { Component, inject } from '@angular/core';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Rule } from 'src/app/data/schema/boho-v2/rule';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { Objects } from 'src/app/data/constants';

export class EventSourceRowItem {
  rule: Rule;
  presetName: string = '';
  scheduleName: string = '';
  isSelected: boolean = false;
  icons: string[] = [];

  constructor(rule: Rule, presetName: string, scheduleName: string) {
    this.rule = rule;
    this.presetName = presetName;
    this.scheduleName = scheduleName;
    this.icons = rule.objects.map(
      (e) => Objects.find((o) => o.id === e)?.icon || ''
    );
  }
}

@Component({
  selector: 'app-event-source',
  templateUrl: 'event-source.component.html',
  styleUrls: ['event-source.component.scss', '../../shared/my-input.scss'],
  standalone: true,
  imports: [FormDialogComponent, FormsModule, SharedModule, CommonModule],
})
export class EventSourceComponent {
  _activeModel = inject(NgbActiveModal);
  data: EventSourceRowItem[] = [];

  cancel() {
    this._activeModel.dismiss();
  }

  submit() {
    this._activeModel.close(this.data.filter((e) => e.isSelected));
  }
}
