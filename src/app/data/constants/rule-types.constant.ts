import { RuleTypeModel } from '../schema/boho-v2';

interface RuleType {
  id: string;
  name: string;
}

export const RuleTypes: RuleType[] = [
  {
    id: 'trespassing event',
    name: 'Đi vào vùng',
  },
  {
    id: 'trespassing event',
    name: 'Đi ra khỏi vùng',
  },
  {
    id: 'loitering event',
    name: 'Đi luẩn quẩn',
  },
  {
    id: 'tripwire event, left to right',
    name: 'Vượt đường kẻ trái sang phải',
  },
  {
    id: 'tripwire event, right to left',
    name: 'Vượt đường kẻ phải sang trái',
  },
  {
    id: 'sabotage event',
    name: 'Gây nhiễu',
  },
  {
    id: 'sabotage event',
    name: 'Phá hoại thiết bị',
  },
];

export const RuleTypeItemsSource: RuleTypeModel[] = [
  {
    id: 'loitering event',
    name: 'Đi lảng vảng ',
    cameraTypes: ['Static', 'PTZ'],
    eit: 1,
  },
  {
    id: 'trespassing event',
    name: 'Xâm nhập trái phép',
    cameraTypes: ['Static', 'PTZ'],
    eit: 3,
  },
  {
    id: 'tripwire event',
    name: 'Vượt đường kẻ',
    cameraTypes: ['Static', 'PTZ'],
    eit: 2,
  },
  {
    id: 'lost event',
    name: 'Đối tượng bị bỏ lại',
    cameraTypes: ['Static'],
    eit: 5,
  },
  {
    id: 'abandon event',
    name: 'Đối tượng bị lấy đi',
    cameraTypes: ['Static'],
    eit: 4,
  },
];
