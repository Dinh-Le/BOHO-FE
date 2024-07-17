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
    id: 'loitering',
    name: 'Luẩn quẩn',
    cameraTypes: ['Static', 'PTZ'],
  },
  {
    id: 'sabotage',
    name: 'Xâm nhập trái phép',
    cameraTypes: ['Static', 'PTZ'],
  },
  {
    id: 'tripwire',
    name: 'Vượt đường kẻ',
    cameraTypes: ['Static', 'PTZ'],
  },
  {
    id: 'lost',
    name: 'Đối tượng bị bỏ lại',
    cameraTypes: ['Static'],
  },
  {
    id: 'abandon',
    name: 'Đối tượng bị lấy đi',
    cameraTypes: ['Static'],
  },
];
