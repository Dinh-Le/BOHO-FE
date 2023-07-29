import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorComponent } from './monitor.component';
import { MonitorRoutingModule } from './monitor-routing.module';
import { SharedModule } from '@shared/shared.module';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { ListViewComponent } from './components/list-view/list-view.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { EventComponent } from './components/event/event.component';


@NgModule({
  declarations: [
    MonitorComponent,
    GridViewComponent,
    MapViewComponent,
    ListViewComponent,
    EventComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MonitorRoutingModule,
    LeafletModule,
  ]
})
export class MonitorModule {
}
