import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  templateUrl: 'svg-icon.component.html',
})
export class SvgIconComponent {
  @Input() width: string = '1em';
  @Input() height: string = '1em';
  @Input() color: string = 'white';
  @Input() icon: string = 'arrow-right-arrow';
  @Input() rotate: string | number = 0;

  get href(): string {
    return `/assets/icons/icons.svg#${this.icon}`;
  }
}
