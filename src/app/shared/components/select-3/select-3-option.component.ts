import {
  Component,
  HostListener,
  Input,
  OnInit,
  Optional,
  TemplateRef,
} from '@angular/core';
import { Select3Component } from './select-3.component';

@Component({
  selector: 'app-select-3-option',
  templateUrl: 'select-3-option.component.html',
  styleUrls: ['select-3-option.component.scss'],
})
export class Select3OptionComponent implements OnInit {
  @Input() template?: TemplateRef<any>;
  @Input() selected = false;
  @Input({ required: true }) value: any;
  @Input({ required: true }) label!: string | number;
  @Input('value-key') valueKey?: string;
  @Input() disabled: boolean = false;

  constructor(@Optional() private root: Select3Component) {}

  onItemClicked() {
    if (this.disabled || (!this.root.multiple && this.selected)) {
      return;
    }

    const value = this.valueKey ? this.value[this.valueKey] : this.value;
    this.root.onItemSelectionChanged(value, !this.selected);
  }

  ngOnInit(): void {
    this.root.subscribe(() => {
      const value = this.valueKey ? this.value[this.valueKey] : this.value;

      if (this.root.multiple) {
        this.selected = this.root.model.includes(value);
      } else {
        this.selected = this.root.model === value;
      }
    });

    this.root.appendOption({
      value: this.valueKey ? this.value[this.valueKey] : this.value,
      label: this.label,
    });
  }
}
