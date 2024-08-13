import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ToastService } from '@app/services/toast.service';
import { retry } from 'rxjs';
import { EventService } from 'src/app/data/service/event.service';

@Component({
  selector: 'app-event-image',
  template: '<canvas  class="w-100 h-100"  #canvas></canvas>',
})
export class EventImage implements AfterViewInit, OnInit, OnDestroy, OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      ('event' in changes &&
        changes['event'].currentValue?.event_id !=
          changes['event'].previousValue?.event_id) ||
      'index' in changes
    ) {
      this.update();
    }

    if ('type' in changes || 'showObject' in changes) {
      this.render();
    }
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

    const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;

    const context = canvas.getContext('2d')!;
    let { clientWidth: canvasWidth, clientHeight: canvasHeight } = canvas;
    if (canvas.width !== canvasWidth) {
      canvasHeight = (canvasWidth * 9) / 16;
      context.canvas.width = canvasWidth - 2;
      context.canvas.height = canvasHeight;
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    // context.reset();

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

    const scaleFactor = Math.min(canvasWidth / width, canvasHeight / height);

    const dx = Math.abs(canvasWidth - width * scaleFactor) / 2;
    const dy = Math.abs(canvasHeight - height * scaleFactor) / 2;
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

      if (this.showObject) {
        let text = '';
        // 1. Person: current = Person --> change = P
        // 2. Car: current = Car --> change = C
        // 3. Truck: current = Truck --> change = T
        // 4. Bus: current = Bus --> change = B
        // 5. Motorcycle: current = Motorcycle --> change = M

        // 0 - bike, 1 - car, 2 - bus, 3 - truck, 4 - ambulance, 5 - firetruck, 6 - people;
        switch (this.event.images_info[this.index].event_type) {
          case 'bike':
            text = 'M';
            break;
          case 'car':
            text = 'C';
            break;
          case 'bus':
            text = 'B';
            break;
          case 'struck':
            text = 'T';
            break;
          case 'people':
            text = 'P';
            break;
          default:
            text = this.event.images_info[this.index].event_type;
            break;
        }

        context.font = '14px Arial';
        const { width: textWidth } = context.measureText(text);

        context.fillStyle = context.strokeStyle;
        context.fillRect(bx, by - 16, Math.max(textWidth, bw), 16);

        context.fillStyle =
          context.strokeStyle === '#ffff00' ? 'black' : 'white';

        context.fillText(text, bx, by - 12 * scaleFactor);
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
