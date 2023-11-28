import {
  Component,
  Input,
  TemplateRef,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { ListViewItemModel } from './list-view-item.model';
import { ControlValueAccessorImpl } from '@shared/helpers/control-value-accessor-impl';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-list-view',
  templateUrl: 'list-view.component.html',
  styleUrls: ['list-view.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListViewComponent),
      multi: true,
    },
  ],
})
export class ListViewComponent extends ControlValueAccessorImpl<ListViewItemModel> {
  @Input() items: ListViewItemModel[] = [];
  @Input() itemTemplate?: TemplateRef<any>;
  @Input() backgroundColor: string = 'white';
  @Input() textColor: string = 'black';
  @Input() activeBackgroundColor: string = 'skyblue';
  @Input() activeTextColor: string = 'black';
  @Output() itemClick = new EventEmitter<ListViewItemModel>();

  trackById(_: any, item: ListViewItemModel) {
    return item.id;
  }

  onItemClick(item: ListViewItemModel) {
    item.isActive = !item.isActive;

    if (item.isActive) {
      this.model = [...this.model, item];
    } else {
      this.model = this.model.filter((e) => e.id != item.id);
    }

    this.itemClick.emit(item);
  }

  getListItemStyles(item: ListViewItemModel) {
    return item.isActive
      ? {
          background: this.activeBackgroundColor,
          color: this.activeTextColor,
        }
      : {
          background: this.backgroundColor,
          color: this.textColor,
        };
  }

  override areEqual(x: ListViewItemModel, y: ListViewItemModel): boolean {
    return x.id === y.id;
  }
}
