import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DeviceService, DeviceData } from './service/device.service';
import { CameraData, CameraService } from './service/camera.service';
import { NodeData, NodeService } from './service/node.service';

const providers = [
  { provide: DeviceData, useClass: DeviceService },
  { provide: CameraData, useClass: CameraService },
  { provide: NodeData, useClass: NodeService },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
})
export class DataModule {
  static forRoot(): ModuleWithProviders<DataModule> {
    return {
      ngModule: DataModule,
      providers: [...providers],
    };
  }
}
