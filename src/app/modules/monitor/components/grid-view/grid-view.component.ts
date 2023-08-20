import { Component, OnInit } from '@angular/core';
import { EventInfo } from 'src/app/data/schema/event-info';
import { EventService } from 'src/app/data/service/event.service';


@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.css']
})
export class GridViewComponent implements OnInit {
  events: EventInfo[] = [];

  constructor (private eventService: EventService) {
  }

  ngOnInit(): void {
    this.eventService.findAll().subscribe(events => this.events = events);
  }
}
