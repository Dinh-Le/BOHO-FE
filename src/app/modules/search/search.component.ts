import { Component, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LoadingService } from '@app/services/loading.service';
import { SelectItemModel } from '@shared/models/select-item-model';
import * as moment from 'moment';
import { EventInfo } from 'src/app/data/schema/event-info';
import { EventService } from 'src/app/data/service/event.service';

interface ItemModel {
  label: string;
  value: string;
  data?: any;
  class?: string;
  selected?: boolean;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private eventService = inject(EventService);
  private loadingService = inject(LoadingService);

  gridColumnSelectItems: SelectItemModel[] = [
    {
      label: '2 cot',
      value: '2',
    },
    {
      label: '3 cot',
      value: '3',
    },
    {
      label: '4 cot',
      value: '4',
    },
    {
      label: '5 cot',
      value: '5',
    },
  ];
  startTimeDropdownItems: ItemModel[] = [
    {
      label: '5p trước',
      value: '5m',
      data: () => moment().subtract(5, 'minute'),
    },
    {
      label: '10p trước',
      value: '10m',
      data: () => moment().subtract(10, 'minute'),
    },
    {
      label: '30p trước',
      value: '30m',
      data: () => moment().subtract(30, 'minute'),
    },
    {
      label: '1h trước',
      value: '1h',
      data: () => moment().subtract(1, 'hour'),
    },
    {
      label: 'Hôm nay',
      value: 'today',
      data: () => moment().startOf('day'),
    },
    {
      label: 'Hôm qua',
      value: 'yester',
      data: () => moment().startOf('day').subtract(1, 'day'),
    },
    {
      label: 'Tuần qua',
      value: 'last-week',
      data: () => moment().startOf('week'),
    },
  ];
  objectDropdownItems: ItemModel[] = [
    {
      label: 'Người',
      value: 'human',
    },
    {
      label: 'Xe máy',
      value: 'motorbike',
    },
    {
      label: 'Ô-tô con',
      value: 'car',
    },
    {
      label: 'Xe tải',
      value: 'truck',
    },
  ];
  colourDropdownItems: ItemModel[] = [
    {
      label: 'Đen',
      value: '#000000',
    },
    {
      label: 'Bạc',
      value: '#C0C0C0',
    },
    {
      label: 'Xám',
      value: '#808080',
    },
    {
      label: 'Trắng',
      value: '#FFFFFF',
    },
    {
      label: 'Đỏ',
      value: '#FF0000',
    },
    {
      label: 'Tím',
      value: '#800080',
    },
    {
      label: 'Hồng',
      value: '#FF00FF',
    },
    {
      label: 'Xanh lá',
      value: '#008000',
    },
    {
      label: 'Vàng',
      value: '#FFFF00',
    },
    {
      label: 'Xanh da trời',
      value: '#0000FF',
    },
  ];
  rulesDropdownItems: ItemModel[] = [
    {
      label: 'Vào vùng cấm',
      value: 'vao_vung_cam',
    },
    {
      label: 'Vượt đường kẻ',
      value: 'vuot_duong_ke',
    },
    {
      label: 'Đi lãng vãng',
      value: 'di_lang_vang',
    },
    {
      label: 'Tác động',
      value: 'tac_dong',
    },
  ];
  severitiesDropdownItems: ItemModel[] = [
    {
      label: 'Cao',
      value: 'high',
    },
    {
      label: 'Trung bình',
      value: 'medium',
    },
    {
      label: 'Bình thường',
      value: 'normal',
    },
  ];
  statusDropdownItems: ItemModel[] = [
    {
      label: 'Tất cả',
      value: 'all',
    },
    {
      label: 'Đã xem',
      value: 'read',
    },
    {
      label: 'Chưa xem',
      value: 'unread',
    },
    {
      label: 'Có sao',
      value: 'valid',
    },
    {
      label: 'Không sao',
      value: 'invalid',
    },
    {
      label: 'Thật',
      value: 'real',
    },
    {
      label: 'Giả',
      value: 'Fake',
    },
  ];

  gridViewFormControl: FormControl = new FormControl(
    this.gridColumnSelectItems[3]
  );
  startTimeFormControl: FormControl = new FormControl(null);
  objectsFormControl: FormControl = new FormControl([]);
  coloursFormControl: FormControl = new FormControl([]);
  severitiesFormControl: FormControl = new FormControl([]);
  rulesFormControl: FormControl = new FormControl([]);
  statusFormControl: FormControl = new FormControl(this.statusDropdownItems[0]);
  viewMode: string = 'grid-view';

  paginationInfo: {
    currentPage: number;
    pageLength: number;
    totalItems: number;
  } = {
    currentPage: 1,
    pageLength: 30,
    totalItems: 0,
  };
  events: EventInfo[] = [];

  ngOnInit(): void {
    this.gridViewFormControl.valueChanges.subscribe((value) => {
      if (value) {
        this.viewMode = 'grid-view';
      }
    });

    this.eventService.findAll().subscribe((events) => {
      this.events = events;
      this.paginationInfo.totalItems = this.events.length;
    });
  }

  get currentEvents(): (EventInfo | null)[] {
    let startIndex =
      (this.paginationInfo.currentPage - 1) * this.paginationInfo.pageLength;
    let endIndex = startIndex + this.paginationInfo.pageLength;

    let currentEvents: (EventInfo | null)[] = this.events.slice(
      startIndex,
      endIndex
    );

    if (currentEvents.length < this.paginationInfo.pageLength) {
      let n = this.paginationInfo.pageLength - currentEvents.length;
      currentEvents.push(...Array(n).fill(null));
    }

    return currentEvents;
  }

  get currentGridColumns() {
    return (this.gridViewFormControl.value as SelectItemModel)?.value || '0';
  }

  setMapView() {
    this.viewMode = 'map-view';
    this.gridViewFormControl.setValue(null);
  }

  search() {
    this.loadingService.loading = true;
    setTimeout(() => (this.loadingService.loading = false), 3000);
  }

  onPageChanged(value: number) {
    this.paginationInfo.currentPage = value;
  }
}
