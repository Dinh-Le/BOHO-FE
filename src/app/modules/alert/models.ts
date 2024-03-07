import { SelectItemModel } from '@shared/models/select-item-model';
import { Device } from 'src/app/data/schema/boho-v2';
import { SearchEvent } from 'src/app/data/service/search.service';

export interface EventFilterOptions {
  timePeriod: SelectItemModel;
  rules: SelectItemModel[];
  objects: SelectItemModel[];
  severities: SelectItemModel[];
  status: SelectItemModel;
}

export interface EventInfo {
  data: SearchEvent;
  device: Device;
  background_color: string;
  object_icon: string;
  severity: string;
  selected?: boolean;
}
