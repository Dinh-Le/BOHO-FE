import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorComponent } from './monitor.component';
import { MonitorRoutingModule } from './monitor-routing.module';


@NgModule({
  declarations: [
    MonitorComponent,
  ],
  imports: [
    CommonModule,
    MonitorRoutingModule,
  ]
})
export class MonitorModule {
}
