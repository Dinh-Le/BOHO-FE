import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { AlertRoutingModule } from './alert-routing.module';
import { SharedModule } from '@shared/shared.module';
import { GridViewComponent } from './grid-view/grid-view.component';
import { MapViewComponent } from './map-view/map-view.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapEventInfoComponent } from './map-view/map-event-info/map-event-info.component';

@NgModule({
  declarations: [
    AlertComponent,
    GridViewComponent,
    MapViewComponent,
    MapEventInfoComponent,
  ],
  imports: [CommonModule, SharedModule, AlertRoutingModule, LeafletModule],
})
export class AlertModule {}
