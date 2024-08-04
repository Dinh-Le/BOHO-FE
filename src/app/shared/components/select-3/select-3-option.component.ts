import { Component, Input, OnInit, Optional, TemplateRef } from '@angular/core';
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

  onItemClicked(event: MouseEvent) {
    event.stopPropagation();

    if (this.disabled || (!this.root.multiple && this.selected)) {
      return;
    }

    this.root.onItemSelectionChanged(this.value, !this.selected, (a, b) =>
      this.areEqual(a, b)
    );
  }

  ngOnInit(): void {
    const updateSelected = (): void => {
      if (this.root.multiple) {
        this.selected = this.root.model.some((e: any) =>
          this.areEqual(e, this.value)
        );
      } else {
        this.selected = this.areEqual(this.root.model, this.value);
      }
    };

    this.root.subscribe(updateSelected.bind(this));

    this.root.appendOption({
      value: this.value,
      label: this.label,
      compareFn: (a: any, b: any) => this.areEqual(a, b),
    });

    updateSelected();
  }

  areEqual(a: any, b: any): boolean {
    return this.valueKey ? a?.[this.valueKey] === b?.[this.valueKey] : a === b;
  }
}
