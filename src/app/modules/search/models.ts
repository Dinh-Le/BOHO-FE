import { SearchEvent } from 'src/app/data/service/search.service';

export interface EventData {
  data: SearchEvent;
  address: string;
  selected?: boolean;
  objectIcon: string;
  cameraType: string;
}
