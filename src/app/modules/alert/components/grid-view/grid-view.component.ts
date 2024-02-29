import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { MqttEventMessage } from '@modules/alert/alert.component';

@Component({
  selector: 'app-grid-view',
  templateUrl: 'grid-view.component.html',
  styleUrls: ['grid-view.component.scss'],
})
export class GridViewComponent implements OnChanges {
  private _viewContainerRef = inject(ViewContainerRef);
  @Input() events: MqttEventMessage[] = [];
  @Input() col: number = 2;
  @Input() maxLength: number = 50;

  ngOnChanges(changes: SimpleChanges): void {
    if ('col' in changes) {
      const el = this._viewContainerRef.element.nativeElement as HTMLElement;
      el.style[
        'gridTemplateColumns'
      ] = `repeat(${changes['col'].currentValue}, 1fr)`;
    }
  }

  trackByDetectionId(_: number, data: MqttEventMessage) {
    return data.detection_id;
  }

  get count() {
    return this.col * Math.ceil(this.maxLength / this.col);
  }
}
