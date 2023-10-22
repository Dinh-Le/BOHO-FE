import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManageRoutingModule } from './manage-routing.module';
import { ManageComponent } from './manage.component';
import { CameraComponent } from './camera/camera.component';
import { RuleComponent } from './rule/rule.component';
import { SharedModule } from '@shared/shared.module';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CameraDetailComponent } from './camera-detail/camera-detail.component';
import { PresetSettingsComponent } from './camera-detail/preset-settings/preset-settings.component';
import { PatrolSettingsComponent } from './camera-detail/patrol-settings/patrol-settings.component';
import { TourSettingsComponent } from './camera-detail/tour-settings/tour-settings.component';
import { CustomListViewComponent } from './custom-list-view/custom-list-view.component';

@NgModule({
  declarations: [
    ManageComponent,
    CameraComponent,
    RuleComponent,
    CameraDetailComponent,
    PresetSettingsComponent,
    PatrolSettingsComponent,
    TourSettingsComponent,
    CustomListViewComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ManageRoutingModule,
    SharedModule,
    NgbCollapseModule,
  ],
})
export class ManageModule {}
