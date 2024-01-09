import {
  Component,
  Input,
  ViewChild,
  OnInit,
  AfterViewInit,
  ElementRef,
  inject,
  OnChanges,
  SimpleChanges,
  forwardRef,
  HostListener,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueAccessorImpl } from '@shared/helpers/control-value-accessor-impl';
import { of, switchMap } from 'rxjs';
import { DeviceService } from 'src/app/data/service/device.service';
import { v4 } from 'uuid';

export declare interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-bounding-box-editor',
  templateUrl: 'bounding-box-editor.component.html',
  styleUrls: ['bounding-box-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BoundingBoxEditorComponent),
      multi: true,
    },
  ],
})
export class BoundingBoxEditorComponent
  extends ControlValueAccessorImpl<Point[]>
  implements OnInit, AfterViewInit, OnChanges
{
  private _deviceService = inject(DeviceService);

  @ViewChild('canvas', { static: false })
  canvas?: ElementRef<HTMLCanvasElement>;
  tabIndex: string = v4();

  @Input() type: string = 'line';
  @Input() src: {
    nodeId: string;
    deviceId: string;
  } = {
    nodeId: '',
    deviceId: '',
  };

  private _elRef = inject(ElementRef);
  private _scaleX = 1;
  private _scaleY = 1;
  private _image: any;
  private _isDrawing: boolean = false;

  ngOnInit(): void {
    this.model = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('type' in changes) {
      this.model = [];
      this._isDrawing = false;
      this.update();
    }

    if ('src' in changes && this.src.nodeId && this.src.deviceId) {
      this._deviceService
        .snapshot(this.src.nodeId, this.src.deviceId)
        .pipe(
          switchMap((response) => {
            if (!response.success) {
              throw Error(
                `Take snapshot failed with error ${response.message}`
              );
            }

            return of(response.data);
          })
        )
        .subscribe({
          next: (data) => {
            this._image = new Image(data.size[0], data.size[1]);
            this._image.src = `data:image/${data.format};charset=utf-8;base64,${data.img}`;
            this._image.onload = (_: any) => this.update();
          },
          error: ({ message }) => console.error(message),
        });
    }
  }

  @HostListener('')
  ngAfterViewInit(): void {
    if (this.canvas) {
      const { width, height } =
        this._elRef.nativeElement.getBoundingClientRect();
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
    }
    this.update();
  }

  onMouseMove(ev: MouseEvent): void {
    if (!this._isDrawing || this._isDisabled) {
      return;
    }

    if (this.model.length >= 2) {
      this.model.pop();
    }

    const { x, y } = this.getMousePosition(ev);
    this.model.push({ x, y });
    this.update();
  }

  onClick(ev: MouseEvent): void {
    if (this._isDisabled) {
      return;
    }

    const { x, y } = this.getMousePosition(ev);

    if (!this._isDrawing && this.model.length === 0) {
      this._isDrawing = true;
    }

    if (this._isDrawing) {
      this.model.push({ x, y });
      this.update();
    }

    if (this.type === 'line') {
      this._isDrawing = this.model.length < 2;
    }
  }

  onDblClick(ev: Event): void {
    if (this._isDisabled) {
      return;
    }

    this._isDrawing = false;
    this.model.pop();
    this.update();
  }

  onKeyDown(ev: KeyboardEvent): boolean {
    if (this._isDisabled) {
      return false;
    }

    if (ev.key === 'Delete') {
      this.model = [];
      this._isDrawing = false;
      this.update();
      return true;
    }

    if (ev.key === 'Escape') {
      this._isDrawing = false;
      this.model.pop();
      this.update();
      return true;
    }

    return false;
  }

  private getMousePosition(ev: MouseEvent | PointerEvent): Point {
    const { left, top } = this.canvas!.nativeElement.getBoundingClientRect()!;
    const x = (ev.clientX - left) / this._scaleX;
    const y = (ev.clientY - top) / this._scaleY;
    return { x, y };
  }

  private update(): void {
    if (!this.canvas || !this._image) {
      return;
    }

    const { width, height } = this.canvas.nativeElement;

    this._scaleX = width / this._image.width;
    this._scaleY = height / this._image.height;

    const context = this.canvas!.nativeElement.getContext('2d')!;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);

    context.scale(this._scaleX, this._scaleY);
    context.drawImage(this._image, 0, 0);

    if (this.model.length) {
      if (this._isDrawing || this.type === 'line') {
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(this.model[0].x, this.model[0].y);
        for (let i = 1; i < this.model.length - 1; i++) {
          context.lineTo(this.model[i].x, this.model[i].y);
        }
        context.lineTo(
          this.model[this.model.length - 1].x,
          this.model[this.model.length - 1].y
        );

        context.stroke();
      } else {
        context.fillStyle = '#FF007F3F';
        context.beginPath();
        context.moveTo(this.model[0].x, this.model[0].y);
        for (let i = 1; i < this.model.length; i++) {
          context.lineTo(this.model[i].x, this.model[i].y);
        }
        context.closePath();
        context.fill();
      }
    }
  }
}
