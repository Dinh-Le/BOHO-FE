import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MonitorComponent } from "./monitor.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: MonitorComponent
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MonitorRoutingModule { }