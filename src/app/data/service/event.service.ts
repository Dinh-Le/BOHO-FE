import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventInfo } from '../schema/event-info';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: EventInfo[] = [];

  constructor() { 
    this.events = Array(100).fill(0).map(_ => Object.assign({}, {
      thumbnailUrl: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTirTLZGJkc8CsFcR-FTUBvCuK0oW4Qlbi5zSZqfjdo8HBf8xWkrYv9M2QP0Ekpc9HGXe8l39aQZx95Od8',
      videoUrl: '\/assets\/videos\/event.mp4',
      eventType: 'Lovely cat',
      timestamp: new Date().toISOString(),
    }));
  }

  findAll(): Observable<EventInfo[]> {
    return of(this.events);
  }
}
