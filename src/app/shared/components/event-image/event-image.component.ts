import { HttpClient } from '@angular/common/http';
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
})
export class EventImage implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;
  @Input() event: any;

  constructor(
    private eventService: EventService,
    private toastService: ToastService,
    private httpClient: HttpClient
  ) {}

  ngAfterViewInit(): void {
    // console.log(this.imageRef.nativeElement);
    // console.log(this.event);
    this.eventService
      .getImage(
        this.event.node_id,
        this.event.device_id,
        this.event.images_info[0].event_id,
        'full'
      )
      .subscribe({
        next: (blod) => {
          const image = new Image();
          image.onload = () => {
            const width = image.width;
            const height = image.height;

            const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;
            const context = canvas.getContext('2d')!;
            const rect = canvas.getBoundingClientRect();

            console.log({ width, height, rect });

            const scaleFactor =
              Math.min(rect.width / width, rect.height / height) / 2;

            const dx = (rect.width - width * scaleFactor) / 2;
            const dy = (rect.height - height * scaleFactor) / 2;
            context.drawImage(
              image,
              0,
              0,
              width * scaleFactor,
              height * scaleFactor
            );
          };
          image.src = URL.createObjectURL(blod);
        },
        error: ({ message }) => this.toastService.showError(message),
      });
  }
}
