import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
import {
  NgbDropdownModule,
  NgbModalModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';
import { ListViewComponent } from './components/list-view/list-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { EventComponent } from './components/event/event.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SearchComponent,
    ListViewComponent,
    MapViewComponent,
    GridViewComponent,
    EventComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbTooltipModule,
    SharedModule,
    SearchRoutingModule,
    LeafletModule,
  ],
})
export class SearchModule {}
