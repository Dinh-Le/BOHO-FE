import { AfterViewInit, Component, ContentChild, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventInfo } from 'src/app/data/schema/event-info';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent {
  @Input('data')
  data!: EventInfo;

  constructor(
    private modalService: NgbModal
  ) { }

  showEventPlaybackDialog(content: any) {
    this.modalService.open(content, {
      modalDialogClass: 'event-playback-dialog'
    });
  }

  playback() {
    const player = document.getElementById('video-player') as HTMLMediaElement;
    player.currentTime = 2;
    player.play();
  }
}
