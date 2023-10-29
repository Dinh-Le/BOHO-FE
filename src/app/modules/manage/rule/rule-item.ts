import { SelectItemModel } from '@shared/models/select-item-model';

export interface RuleItem {
  id: string;
  name: string;
  status?: boolean;
  type?: SelectItemModel;
  objects?: SelectItemModel[];
  tour?: {
    id: string;
    name: string;
  };
  tenTichHop?: string;
  diemGiamSat?: {
    id: string;
    name: string;
  };
  thoiGianVuot?: number;
  severity?: {
    id: string;
    name: string;
  };
  schedule?: {
    id: string;
    name: string;
  };
  isExpanded?: boolean;
  isEditable?: boolean;
}

export const mockRules: RuleItem[] = [
  {
    id: '1',
    name: 'Vượt rào từ ngoài vào',
    status: false,
    tour: {
      id: '1',
      name: 'Lịch trình 1',
    },
    tenTichHop: '',
    diemGiamSat: {
      id: '1',
      name: 'Điểm giám sát',
    },
    thoiGianVuot: 1,
    severity: {
      id: '1',
      name: 'Nguy hiểm',
    },
    schedule: {
      id: '1',
      name: 'Lịch trình 1',
    },
  },
  {
    id: '2',
    name: 'Vượt rào từ ngoài vào',
    status: true,
    tour: {
      id: '1',
      name: 'Lịch trình 1',
    },
    tenTichHop: '',
    diemGiamSat: {
      id: '1',
      name: 'Điểm giám sát',
    },
    thoiGianVuot: 1,
    severity: {
      id: '1',
      name: 'Nguy hiểm',
    },
    schedule: {
      id: '1',
      name: 'Lịch trình 1',
    },
  },
  {
    id: '3',
    name: 'Vượt rào từ ngoài vào',
    status: true,
    tour: {
      id: '1',
      name: 'Lịch trình 1',
    },
    tenTichHop: '',
    diemGiamSat: {
      id: '1',
      name: 'Điểm giám sát',
    },
    thoiGianVuot: 1,
    severity: {
      id: '1',
      name: 'Nguy hiểm',
    },
    schedule: {
      id: '1',
      name: 'Lịch trình 1',
    },
  },
];
