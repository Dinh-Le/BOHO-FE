import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { EventService } from 'src/app/data/service/event.service';

@Component({
  selector: 'app-event-image',
  template: '<canvas #canvas style="width: 100%; height: 100%"></canvas>',
  styles: [':host{display: block; width: 100%; height: 100%}'],
})
export class EventImage implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;
  @Input() event: any;
  @Input() type: 'full' | 'crop' = 'full';

  image: HTMLImageElement | undefined;

  constructor(
    private elRef: ElementRef,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngAfterViewInit(): void {
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
            const width =
              this.type === 'full'
                ? this.image!.width
                : this.image!.width *
                  Math.abs(
                    this.event.images_info[0].bounding_box.bottomrightx -
                      this.event.images_info[0].bounding_box.topleftx
                  );
            const height =
              this.type === 'full'
                ? this.image!.height
                : this.image!.height *
                  Math.abs(
                    this.event.images_info[0].bounding_box.bottomrighty -
                      this.event.images_info[0].bounding_box.toplefty
                  );
            const sx =
              this.type === 'full'
                ? 0
                : this.event.images_info[0].bounding_box.bottomrightx * width;
            const sy =
              this.type === 'full'
                ? 0
                : this.event.images_info[0].bounding_box.bottomrighty * height;

            const rect = this.elRef.nativeElement.getBoundingClientRect();
            const scaleFactor = Math.min(
              rect.width / width,
              rect.height / height
            );

            const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
            canvas.width = rect.width;
            canvas.height = rect.height;

            const context = canvas.getContext('2d')!;

            const dx = (rect.width - width * scaleFactor) / 2;
            const dy = (rect.height - height * scaleFactor) / 2;
            context.drawImage(
              this.image!,
              sx,
              sy,
              width,
              height,
              dx,
              dy,
              width * scaleFactor,
              height * scaleFactor
            );

            // Render the bounding box if full image
            if (this.type === 'full') {
              context.beginPath();
              const bx =
                dx +
                width *
                  scaleFactor *
                  this.event.images_info[0].bounding_box.bottomrightx;
              const by =
                dy +
                height *
                  scaleFactor *
                  this.event.images_info[0].bounding_box.bottomrighty;
              const bw =
                Math.abs(
                  this.event.images_info[0].bounding_box.bottomrightx -
                    this.event.images_info[0].bounding_box.topleftx
                ) *
                width *
                scaleFactor;
              const bh =
                Math.abs(
                  this.event.images_info[0].bounding_box.bottomrighty -
                    this.event.images_info[0].bounding_box.toplefty
                ) *
                height *
                scaleFactor;
              context.strokeStyle = 'red';
              context.rect(bx, by, bw, bh);
              context.stroke();
            }
          };
          this.image.src = URL.createObjectURL(blod);
        },
        error: ({ message }) => this.toastService.showError(message),
      });
  }
}
