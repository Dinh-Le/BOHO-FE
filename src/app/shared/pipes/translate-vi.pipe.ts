import { Pipe, PipeTransform } from '@angular/core';

const VI_Dict: {
  [key: string]: string;
} = {
  online: 'Tốt',
  offline: 'Mất Kết Nối',
  error: 'Có Lỗi',
  'trespassing event': 'Xâm nhập vùng',
  'loitering event': 'Đi luẩn quẩn',
  'tripwire event': 'Vượt đường kẻ',
  car: 'Ô tô',
  people: 'Người',
  bike: 'Xe máy',
  bus: 'Xe buýt',
  struck: 'Xe tải',
  white: 'Trắng',
  black: 'Đen',
  blue: 'Xanh',
  brown: 'Nâu',
  gray: 'Xám',
  green: 'Xanh lá cây',
  pink: 'Hồng',
  red: 'Đỏ',
  yellow: 'Vàng',
};

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(value: string | undefined, ...args: any[]) {
    return VI_Dict[value?.toLowerCase() ?? ''] || value;
  }
}
