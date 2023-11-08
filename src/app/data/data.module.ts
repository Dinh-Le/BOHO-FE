import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DeviceData } from './service/device.service';
import { CameraData } from './service/camera.service';
import { NodeService } from './service/node.service';
import {
  MockCameraService,
  MockDeviceService,
  MockNodeService,
} from './service/mock.service';

const providers = [
  { provide: DeviceData, useClass: MockDeviceService },
  { provide: CameraData, useClass: MockCameraService },
  { provide: NodeService, useClass: MockNodeService },
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
