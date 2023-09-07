import { Component, Input, OnInit } from '@angular/core';
import { EventInfo } from 'src/app/data/schema/event-info';
import { EventService } from 'src/app/data/service/event.service';


@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css']
})
export class GridViewComponent implements OnInit {
  @Input()
  cols: string = '3';

  events: EventInfo[] = [];  

  constructor (private eventService: EventService) {
  }

  get gridTemplateColumns() {
    return `repeat(${this.cols}, 1fr)`;
  }

  ngOnInit(): void {
    this.eventService.findAll().subscribe(events => this.events = events);
  }
}
