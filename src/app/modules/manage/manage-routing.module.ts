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

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ManageComponent,
        children: [
          {
            path: 'camera',
            pathMatch: 'full',
            component: CameraComponent,
          },
          {
            path: 'camera-detail',
            component: CameraDetailComponent,
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'preset-settings',
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
            path: 'system',
            component: SystemComponent,
          },
          {
            path: 'group-node',
            component: GroupNodeComponent,
          },
          {
            path: 'rule',
            component: RuleComponent,
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
