import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { AlertRoutingModule } from './alert-routing.module';
import { SharedModule } from '@shared/shared.module';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapEventInfoComponent } from './components/map-view/map-event-info/map-event-info.component';
import { ListViewComponent } from './components/list-view/list-view.component';

@NgModule({
  declarations: [
    AlertComponent,
    GridViewComponent,
    ListViewComponent,
    MapViewComponent,
    MapEventInfoComponent,
  ],
  imports: [CommonModule, SharedModule, AlertRoutingModule, LeafletModule],
})
export class AlertModule {}
