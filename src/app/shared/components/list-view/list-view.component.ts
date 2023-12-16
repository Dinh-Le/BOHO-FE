import {
  Component,
  Input,
  TemplateRef,
  forwardRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { ListViewItemModel } from './list-view-item.model';
import { ArrayControlValueAccessorImpl } from '@shared/helpers/array-control-value-accessor-impl';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { faLessThanEqual } from '@fortawesome/free-solid-svg-icons';

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
export class ListViewComponent extends ArrayControlValueAccessorImpl<ListViewItemModel> {
  @Input() items: ListViewItemModel[] = [];
  @Input() itemTemplate?: TemplateRef<any>;
  @Input() backgroundColor: string = 'white';
  @Input() textColor: string = 'black';
  @Input() activeBackgroundColor: string = 'skyblue';
  @Input() activeTextColor: string = 'black';
  @Input() multiple: boolean = true;
  @Output() itemClick = new EventEmitter<ListViewItemModel>();

  trackById(_: any, item: ListViewItemModel) {
    return item.id;
  }

  onItemClick(item: ListViewItemModel) {
    if (this.multiple) {
      item.isActive = !item.isActive;

      if (this.multiple) {
        if (item.isActive) {
          this.model = [...this.model, item];
        } else {
          this.model = this.model.filter((e) => e.id != item.id);
        }
      }
    } else {
      if (this.model.length > 0) {
        this.model.forEach((e) => (e.isActive = false));
      }

      item.isActive = true;
      this.model = [item];
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
