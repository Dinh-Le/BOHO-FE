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
import { ExpandableTableComponent } from './expandable-table/expandable-table.component';
import { SystemComponent } from './system/system.component';
import { GroupNodeComponent } from './group-node/group-node.component';
import { NodeComponent } from './node/node.component';
import { CameraInfoComponent } from './camera-detail/camera-info/camera-info.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { GroupCameraComponent } from './group-camera/group-camera.component';
import { VehicleListComponent } from './vehical-list/vehicle-list.component';
import { VehicleListDetailComponent } from './vehicle-list-detail/vehicle-list-detail.component';
import { TimeInputComponent } from './camera-detail/tour-settings/time-input/time-input.component';
import { EditableListViewComponent } from './camera-detail/editable-list-view/editable-list-view.component';
import { IntegrationComponent } from './integration/integration.component';
import { CameraSettingsComponent } from './camera-detail/camera-settings/camera-settings.component';
import { NodeDashboardComponent } from './node-dashboard/node-dashboard.component';
import { NgChartsModule } from 'ng2-charts';
import { AutoResizeDirective } from './node-dashboard/auto-resize.directive';
import { GroupNodeDashboardComponent } from './group-node-dashboard/group-node-dashboard.component';
import { CameraDashboardComponent } from './camera-dashboard/camera-dashboard.component';
import { EmptyComponent } from './empty/empty.component';
import { FormDialogComponent } from '@shared/components/form-dialog/form-dialog.component';

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
    ExpandableTableComponent,
    SystemComponent,
    GroupNodeComponent,
    NodeComponent,
    CameraInfoComponent,
    GroupCameraComponent,
    VehicleListComponent,
    VehicleListDetailComponent,
    TimeInputComponent,
    EditableListViewComponent,
    IntegrationComponent,
    CameraSettingsComponent,
    NodeDashboardComponent,
    GroupNodeDashboardComponent,
    CameraDashboardComponent,
    AutoResizeDirective,
    EmptyComponent,
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
    NgChartsModule,
    FormDialogComponent,
  ],
})
export class ManageModule {}
