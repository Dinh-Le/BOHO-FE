import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ManageComponent } from './manage.component';
import { CameraComponent } from './camera/camera.component';
import { RuleComponent } from './rule/rule.component';
import { CameraDetailComponent } from './camera-detail/camera-detail.component';
import { PresetSettingsComponent } from './camera-detail/preset-settings/preset-settings.component';
import { PatrolSettingsComponent } from './camera-detail/patrol-settings/patrol-settings.component';
import { TourSettingsComponent } from './camera-detail/tour-settings/tour-settings.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { SystemComponent } from './system/system.component';
import { GroupNodeComponent } from './group-node/group-node.component';
import { NodeComponent } from './node/node.component';
import { CameraInfoComponent } from './camera-detail/camera-info/camera-info.component';
import { GroupCameraComponent } from './group-camera/group-camera.component';
import { VehicleListComponent } from './vehical-list/vehicle-list.component';
import { VehicleListDetailComponent } from './vehicle-list-detail/vehicle-list-detail.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ManageComponent,
        children: [
          {
            path: 'group-camera',
            component: GroupCameraComponent,
          },
          {
            path: 'system',
            component: SystemComponent,
          },
          {
            path: 'group-node',
            component: GroupNodeComponent,
          },
          {
            path: 'group-node/:nodeOperatorId/node',
            component: NodeComponent,
          },
          {
            path: 'node/:nodeId/camera',
            component: CameraComponent,
          },
          {
            path: 'camera/:cameraId',
            component: CameraDetailComponent,
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'info',
              },
              {
                path: 'info',
                component: CameraInfoComponent,
              },
              {
                path: 'preset-settings',
                component: PresetSettingsComponent,
              },
              {
                path: 'patrol-settings',
                component: PatrolSettingsComponent,
              },
              {
                path: 'tour-settings',
                component: TourSettingsComponent,
              },
            ],
          },
          {
            path: 'device-rule',
            children: [
              {
                path: ':cameraId/rule',
                component: RuleComponent,
              },
              {
                path: ':cameraId/schedule',
                component: ScheduleComponent,
              }
            ]
          },
          {
            path: 'vehicle-list',
            component: VehicleListComponent,
          },
          {
            path: 'vehicle-list-detail',
            component: VehicleListDetailComponent,
          },
          {
            path: 'schedule',
            component: ScheduleComponent,
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ManageRoutingModule {}
