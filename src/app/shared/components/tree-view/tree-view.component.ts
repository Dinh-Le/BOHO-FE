import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  forwardRef,
} from '@angular/core';
import { TreeViewItemModel } from './tree-view-item.model';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TreeViewConfig } from './tree-view-config';

@Component({
  selector: 'app-tree-view',
  templateUrl: 'tree-view.component.html',
  styleUrls: ['tree-view.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeViewComponent),
      multi: true,
    },
  ],
})
export class TreeViewComponent implements OnChanges, ControlValueAccessor {
  @Input()
  data: TreeViewItemModel = new TreeViewItemModel('', '');

  @Input()
  filter: string = '';

  @Input()
  itemTemplate?: TemplateRef<any>;

  @Input({
    transform: (value: TreeViewConfig): TreeViewConfig =>
      Object.assign(
        {
          multiple: true,
          backgroundColor: 'white',
          activeBackgroundColor: 'lighgray',
          textColor: 'black',
          activeTextColor: 'black',
        },
        value
      ),
  })
  config: TreeViewConfig = {
    multiple: true,
    backgroundColor: 'white',
    activeBackgroundColor: 'lighgray',
    textColor: 'black',
    activeTextColor: 'black',
  };

  ngOnChanges(changes: SimpleChanges): void {
    const { filter } = changes;
    if (filter) {
      if (this.data) {
        this.setFilter(filter.currentValue);
      }
    }
  }

  setFilter(text: string) {
    text = text.trim().toLowerCase();
    if (text === '') {
      this.data.traverse((item) => {
        item.isVisible = true;
      });
    } else {
      this.data.traverse((item) => {
        item.isVisible = false;
      });

      this.data.traverse((item) => {
        item.isVisible = item.label.toLowerCase().includes(text);
        if (item.isVisible) {
          item.traverseInverse((item) => (item.isVisible = true));
        }
      });
    }
  }

  //#region Event handlers
  onTreeItemClick(item: TreeViewItemModel) {
    if (this.config.multiple) {
      if (this.model.some((e) => e.id === item.id)) {
        this.model = this.model.filter((e) => e != item);
      } else {
        this.model = [...this.model, item];
      }
    } else {
      this.model = [item];
    }
  }
  //#endregion

  //#region ngModel
  _model: TreeViewItemModel[] = [];
  _onChange: (items: TreeViewItemModel[]) => void = (_) => {};

  get model() {
    return this._model;
  }

  set model(value: TreeViewItemModel[]) {
    if (
      value.length == this._model.length &&
      value.every((e) => this._model.some((x) => x.id === e.id))
    ) {
      return;
    }

    this._model = value;
    this._onChange(this.model);
  }

  writeValue(items: TreeViewItemModel[]): void {
    this.model = items || [];
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}
  //#endregion
}
