import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { ListViewItemModel } from '@shared/components/list-view/list-view-item.model';
import { SharedModule } from '@shared/shared.module';
import { Objects } from 'src/app/data/constants';
import { Colors } from 'src/app/data/constants/colors.constant';

@Component({
  selector: 'app-select-object-dialog',
  templateUrl: 'select-object-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormDialogComponent,
    SharedModule,
  ],
})
export class SelectObjectDialogComponent {
  activeModal = inject(NgbActiveModal);
  objectItemModels: ListViewItemModel[] = Objects.map((e) => ({
    id: e.id.toString(),
    text: e.name,
    data: e,
  }));
  colors = Colors;
  showHumanColorSelection = false;

  onObjectSelected(item: ListViewItemModel): void {
    this.showHumanColorSelection = item.id === '0';
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close();
  }
}
