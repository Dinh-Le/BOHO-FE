import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NodeService, NodeServiceImpl } from './service/node.service';
import { DeviceService, DeviceServiceImpl } from './service/device.service';
import { UserService, UserServiceImpl } from './service/user.service';
import { GroupService, GroupServiceImpl } from './service/group.service';
import {
  GroupManagementService,
  GroupManagementServiceImpl,
} from './service/group-management.service';
import {
  NodeOperatorService,
  NodeOperatorServiceImpl,
} from './service/node-operator.service';
import { ObjectService, ObjectServiceImpl } from './service/object.service';
import {
  PatrolManagementService,
  PatrolManagementServiceImpl,
} from './service/patrol-management.service';
import {
  PatrolScheduleService,
  PatrolScheduleServiceImpl,
} from './service/patrol-schedule.service';
import { PatrolService, PatrolServiceImpl } from './service/patrol.service';
import { RuleService, RuleServiceImpl } from './service/rule.service';
import { TouringService, TouringServiceImpl } from './service/touring.service';
import {
  MilestoneService,
  MilestoneServiceImpl,
} from './service/milestone.service';
import {
  ScheduleService,
  ScheduleServiceImpl,
} from './service/schedule.service';
import { PresetService, PresetServiceImpl } from './service/preset.service';
import { SearchService, SearchServiceImpl } from './service/search.service';
import { EventService, EventServiceImpl } from './service/event.service';

const providers = [
  { provide: UserService, useClass: UserServiceImpl },
  { provide: DeviceService, useClass: DeviceServiceImpl },
  { provide: GroupService, useClass: GroupServiceImpl },
  { provide: GroupManagementService, useClass: GroupManagementServiceImpl },
  { provide: NodeOperatorService, useClass: NodeOperatorServiceImpl },
  { provide: NodeService, useClass: NodeServiceImpl },
  { provide: ObjectService, useClass: ObjectServiceImpl },
  { provide: PatrolManagementService, useClass: PatrolManagementServiceImpl },
  { provide: PatrolScheduleService, useClass: PatrolScheduleServiceImpl },
  { provide: PatrolService, useClass: PatrolServiceImpl },
  { provide: RuleService, useClass: RuleServiceImpl },
  { provide: TouringService, useClass: TouringServiceImpl },
  { provide: MilestoneService, useClass: MilestoneServiceImpl },
  { provide: ScheduleService, useClass: ScheduleServiceImpl },
  { provide: PresetService, useClass: PresetServiceImpl },
  { provide: SearchService, useClass: SearchServiceImpl },
  { provide: EventService, useClass: EventServiceImpl },
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
