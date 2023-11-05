import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRoutingModule } from './manage-routing.module';
import { ManageComponent } from './manage.component';
import { CameraComponent } from './camera/camera.component';
import { RuleComponent } from './rule/rule.component';
import { SharedModule } from '@shared/shared.module';
import {
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CameraDetailComponent } from './camera-detail/camera-detail.component';
import { PresetSettingsComponent } from './camera-detail/preset-settings/preset-settings.component';
import { PatrolSettingsComponent } from './camera-detail/patrol-settings/patrol-settings.component';
import { TourSettingsComponent } from './camera-detail/tour-settings/tour-settings.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { TimeSelectComponent } from './time-select/time-select.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { ExpandableTableComponent } from './expandable-table/expandable-table.component';
import { SystemComponent } from './system/system.component';
import { GroupNodeComponent } from './group-node/group-node.component';
import { NodeComponent } from './node/node.component';
import { CameraInfoComponent } from './camera-detail/camera-info/camera-info.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { GroupCameraComponent } from './group-camera/group-camera.component';
import { VehicleListComponent } from './vehical-list/vehicle-list.component';
import { VehicleListDetailComponent } from './vehicle-list-detail/vehicle-list-detail.component';

@NgModule({
  declarations: [
    ManageComponent,
    CameraComponent,
    RuleComponent,
    CameraDetailComponent,
    PresetSettingsComponent,
    PatrolSettingsComponent,
    TourSettingsComponent,
    ScheduleComponent,
    TimeSelectComponent,
    MenuBarComponent,
    ExpandableTableComponent,
    SystemComponent,
    GroupNodeComponent,
    NodeComponent,
    CameraInfoComponent,
    GroupCameraComponent,
    VehicleListComponent,
    VehicleListDetailComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ManageRoutingModule,
    SharedModule,
    NgbCollapseModule,
    NgbDropdownModule,
    LeafletModule,
  ],
})
export class ManageModule {}
