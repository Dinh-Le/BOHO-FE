import { Component } from '@angular/core';

interface EventInfo {
  thummnailUrl: string;
  eventType: string;
  timestamp: string;
}

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent {
  events: EventInfo[] = Array(100).fill(0).map(_ => Object.assign({}, {
    thummnailUrl: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcTirTLZGJkc8CsFcR-FTUBvCuK0oW4Qlbi5zSZqfjdo8HBf8xWkrYv9M2QP0Ekpc9HGXe8l39aQZx95Od8',
    eventType: 'Lovely cat',
    timestamp: new Date().toISOString(),
  }));
}
