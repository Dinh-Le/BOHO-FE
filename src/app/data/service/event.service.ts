import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventInfo } from '../schema/event-info';


@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: EventInfo[] = [];
  humanEventInfo: EventInfo = {
    thumbnailUrl: `\/assets\/images\/human.png`,
    videoUrl: '\/assets\/videos\/event.mp4',
    eventType: 'Phat hien nguoi',
    timestamp: new Date().toISOString(),
    level: 'normal',
    object: 'human',
    address: 'Sanh sieu thi Coop',
    favorite: false,
    seen: true,
  };
  carEventInfo: EventInfo = {
    thumbnailUrl: `\/assets\/images\/car.png`,
    videoUrl: '\/assets\/videos\/event.mp4',
    eventType: 'Phat hien xe trong danh sach den',
    timestamp: new Date().toISOString(),
    level: 'high',
    object: 'car',
    licencePlate: '51H-95175',
    address: 'Nga 4 H Dieu - TV Dien',
    favorite: true,
    seen: false,
  };

  constructor() {
    this.events = Array(82)
      .fill(0)
      .map(
        (_, index) => Object.assign(
          {},
          index % 2 == 0 
            ? this.humanEventInfo 
            : this.carEventInfo
        )
      );
  }

  findAll(): Observable<EventInfo[]> {
    return of(this.events);
  }
}
