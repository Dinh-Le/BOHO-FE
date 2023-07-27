import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitorComponent } from './monitor.component';
import { MonitorRoutingModule } from './monitor-routing.module';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    MonitorComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MonitorRoutingModule
  ]
})
export class MonitorModule {
}
