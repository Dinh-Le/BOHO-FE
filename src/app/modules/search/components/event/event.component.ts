import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EventInfo } from 'src/app/data/schema/event-info';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
})
export class EventComponent {
  @Input('data')
  data!: EventInfo;

  get eventInfoBackgroundClass() {
    if (this.data.level === 'medium') {
      return 'bg-primary';
    } else if (this.data.level === 'high') {
      return 'bg-danger';
    } else {
      return 'bg-secondary';
    }
  }

  constructor(private modalService: NgbModal) {}

  showEventPlaybackDialog(content: any) {
    this.modalService.open(content, {
      modalDialogClass: 'event-playback-dialog',
      size: 'xl',
    });
  }

  playback() {
    const player = document.getElementById('video-player') as HTMLMediaElement;
    player.currentTime = 2;
    player.play();
  }
}
