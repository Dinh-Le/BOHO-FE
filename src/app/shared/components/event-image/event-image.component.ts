import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { EventService } from 'src/app/data/service/event.service';

@Component({
  selector: 'app-event-image',
  template: '<canvas #canvas></canvas>',
  styles: [':host{display: block; width: 100%; height: 100%}'],
})
export class EventImage implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvasRef!: ElementRef;
  @Input() event: any;
  @Input() type: 'full' | 'crop' = 'full';

  image: HTMLImageElement | undefined;

  constructor(
    private elRef: ElementRef,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.canvasRef) {
      this.update();
    }
  }

  ngAfterViewInit(): void {
    const rect = this.elRef.nativeElement.getBoundingClientRect();
    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.update();
  }

  update() {
    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.event) {
      return;
    }

    this.eventService
      .getImage(
        this.event.node_id,
        this.event.device_id,
        this.event.images_info[0].detection_id,
        'full'
      )
      .subscribe({
        next: (blod) => {
          this.image = new Image();
          this.image.onload = () => {
            const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
            let { bottomrightx, bottomrighty, topleftx, toplefty } =
              this.event.images_info[0].bounding_box;
            if (bottomrightx < topleftx) {
              bottomrightx = this.event.images_info[0].bounding_box.topleftx;
              topleftx = this.event.images_info[0].bounding_box.bottomrightx;
            }
            if (bottomrighty < toplefty) {
              bottomrighty = this.event.images_info[0].bounding_box.toplefty;
              toplefty = this.event.images_info[0].bounding_box.bottomrighty;
            }

            const width =
              this.image!.width *
              (this.type === 'full' ? 1 : bottomrightx - topleftx);
            const height =
              this.image!.height *
              (this.type === 'full' ? 1 : bottomrighty - toplefty);
            const sx = this.type === 'full' ? 0 : topleftx * this.image!.width;
            const sy = this.type === 'full' ? 0 : toplefty * this.image!.height;

            const scaleFactor = Math.min(
              canvas.width / width,
              canvas.height / height
            );

            const dx = Math.abs(canvas.width - width * scaleFactor) / 2;
            const dy = Math.abs(canvas.height - height * scaleFactor) / 2;
            const dw = width * scaleFactor;
            const dh = height * scaleFactor;
            context.drawImage(
              this.image!,
              sx,
              sy,
              width,
              height,
              dx,
              dy,
              dw,
              dh
            );

            console.log({ sx, sy, width, height, dx, dy, dw, dh });

            // Render the bounding box if full image
            if (this.type === 'full') {
              context.beginPath();
              const bx = dx + this.image!.width * scaleFactor * topleftx;
              const by = dy + this.image!.height * scaleFactor * toplefty;
              const bw = (bottomrightx - topleftx) * width * scaleFactor;
              const bh = (bottomrighty - toplefty) * height * scaleFactor;
              context.strokeStyle = 'red';
              context.rect(bx, by, bw, bh);
              context.stroke();
              console.log({ bx, by, bw, bh });
            }
          };
          this.image.src = URL.createObjectURL(blod);
        },
        error: ({ message }) => this.toastService.showError(message),
      });
  }
}
