import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';
import { ListViewItemModel } from '@shared/components/list-view/list-view-item.model';
import { SharedModule } from '@shared/shared.module';
import { Objects } from 'src/app/data/constants';
import { Colors } from 'src/app/data/constants/colors.constant';

export class ObjectItemModel implements ListViewItemModel {
  id: string;
  text: string;
  data?: any;
  isActive?: boolean;
  isSelected?: boolean;
  icon: string;
  colors: string[] = ['', ''];

  constructor({ id, name, icon }: any) {
    this.id = id.toString();
    this.text = name;
    this.icon = icon;
  }
}

@Component({
  selector: 'app-select-object-dialog',
  templateUrl: 'select-object-dialog.component.html',
  styleUrls: ['select-object-dialog.component.scss'],
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
  objectItemModels: ObjectItemModel[] = Objects.map(
    (e) => new ObjectItemModel(e)
  );
  colors = Colors;
  showHumanColorSelection = false;
  selectedItem?: ObjectItemModel;

  get data(): ObjectItemModel[] {
    return this.objectItemModels.filter((e) => e.isSelected);
  }

  set data(items: ObjectItemModel[]) {
    for (const item of items) {
      const objectItemModel = this.objectItemModels.find(
        (e) => e.id === item.id
      );
      if (objectItemModel) {
        objectItemModel.colors = item.colors;
        objectItemModel.isSelected = true;
      }
    }
  }

  onObjectSelected(item: ListViewItemModel): void {
    this.showHumanColorSelection = item.id === '0';
    this.selectedItem = item as ObjectItemModel;
  }

  onSelectionChange(value: boolean) {
    if (!value && this.selectedItem) {
      this.selectedItem.colors = ['', ''];
      return;
    }

    if (value && this.selectedItem) {
      this.selectedItem.colors =
        this.selectedItem.id === '0'
          ? [this.colors[0], this.colors[0]]
          : [this.colors[0], ''];
    }
  }

  cancel() {
    this.activeModal.dismiss();
  }

  submit() {
    this.activeModal.close({ data: this.data });
  }
}
