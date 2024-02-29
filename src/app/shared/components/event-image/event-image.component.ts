import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { observable, retry } from 'rxjs';
import { EventService } from 'src/app/data/service/event.service';

@Component({
  selector: 'app-event-image',
  template: '<canvas  class="w-100 h-100"  #canvas></canvas>',
})
export class EventImage implements AfterViewInit, OnInit, OnDestroy {
  @HostBinding('class') classes = 'w-100 h-100 d-block';
  @ViewChild('canvas') canvasRef!: ElementRef;
  @Input() event: any;
  @Input() type: 'full' | 'crop' = 'full';
  @Input() showObject: boolean = false;
  @Input() index: number = 0;

  image: HTMLImageElement | undefined;
  resizeObserver: ResizeObserver;

  constructor(
    private elRef: ElementRef,
    private eventService: EventService,
    private toastService: ToastService
  ) {
    this.resizeObserver = new ResizeObserver(() => {
      this.render();
      // this.resizeObserver?.unobserve(this.elRef.nativeElement);
    });
  }

  ngOnInit(): void {
    this.resizeObserver.observe(this.elRef.nativeElement);
  }

  ngAfterViewInit(): void {
    this.update();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.unobserve(this.elRef.nativeElement);
  }

  render() {
    if (!this.image) {
      return;
    }

    const rect = this.elRef.nativeElement.getBoundingClientRect();
    
    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    if (parseInt(canvas.width.toString()) !== parseInt(rect.width)) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }    

    const context = canvas.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);

    let { bottomrightx, bottomrighty, topleftx, toplefty } =
      this.event.images_info[this.index].bounding_box;

    if (bottomrightx >= 1) {
      bottomrightx /= this.image!.width;
      bottomrighty /= this.image!.height;
      topleftx /= this.image!.width;
      toplefty /= this.image!.height;
    }

    if (bottomrightx < topleftx) {
      bottomrightx = this.event.images_info[this.index].bounding_box.topleftx;
      topleftx = this.event.images_info[this.index].bounding_box.bottomrightx;
    }
    if (bottomrighty < toplefty) {
      bottomrighty = this.event.images_info[this.index].bounding_box.toplefty;
      toplefty = this.event.images_info[this.index].bounding_box.bottomrighty;
    }

    const width =
      this.image!.width * (this.type === 'full' ? 1 : bottomrightx - topleftx);
    const height =
      this.image!.height * (this.type === 'full' ? 1 : bottomrighty - toplefty);
    const sx = this.type === 'full' ? 0 : topleftx * this.image!.width;
    const sy = this.type === 'full' ? 0 : toplefty * this.image!.height;

    const scaleFactor = Math.min(canvas.width / width, canvas.height / height);

    const dx = Math.abs(canvas.width - width * scaleFactor) / 2;
    const dy = Math.abs(canvas.height - height * scaleFactor) / 2;
    const dw = width * scaleFactor;
    const dh = height * scaleFactor;
    context.drawImage(this.image!, sx, sy, width, height, dx, dy, dw, dh);

    // Render the bounding box if full image
    if (this.type === 'full') {
      context.beginPath();
      const bx = dx + this.image!.width * scaleFactor * topleftx;
      const by = dy + this.image!.height * scaleFactor * toplefty;
      const bw = (bottomrightx - topleftx) * width * scaleFactor;
      const bh = (bottomrighty - toplefty) * height * scaleFactor;

      if (this.event.images_info[this.index].bounding_box_color) {
        context.strokeStyle =
          this.event.images_info[this.index].bounding_box_color;
      } else {
        const { alarm_level } = this.event;
        switch (alarm_level) {
          case 1:
            context.strokeStyle = 'green';
            break;
          case 2:
            context.strokeStyle = 'yellow';
            break;
          case 3:
            context.strokeStyle = 'red';
            break;
          default:
            context.strokeStyle = 'black';
            break;
        }
      }

      context.rect(bx, by, bw, bh);
      context.stroke();
      // console.log({ bx, by, bw, bh });

      if (this.showObject) {
        const text = this.event.images_info[this.index].event_type;

        context.font = '14px Arial';
        const { width: textWidth } = context.measureText(text);

        context.fillStyle = context.strokeStyle;
        context.fillRect(bx, by - 16, Math.max(textWidth, bw), 16);

        context.fillStyle =
          context.strokeStyle === '#ffff00' ? 'black' : 'white';
        // console.log(context.strokeStyle, context.fillStyle);
        context.fillText(
          this.event.images_info[this.index].event_type,
          bx,
          by - 12 * scaleFactor
        );
      }
    }
  }

  update() {
    if (!this.event) {
      return;
    }

    this.eventService
      .getImage(
        this.event.node_id,
        this.event.device_id,
        this.event.images_info[this.index].detection_id,
        'full'
      )
      .pipe(
        retry({
          count: 3,
          delay: 5000,
        })
      )
      .subscribe({
        next: (blod) => {
          this.image = new Image();
          this.image.onload = () => this.render();
          this.image.src = URL.createObjectURL(blod);
        },
        error: ({ message }) => this.toastService.showError(message),
      });
  }
}
