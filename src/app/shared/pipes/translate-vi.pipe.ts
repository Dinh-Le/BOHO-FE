import { Pipe, PipeTransform } from '@angular/core';

const VI_Dict: {
  [key: string]: string;
} = {
  ONLINE: 'Tốt',
  OFFLINE: 'Mất Kết Nối',
  ERROR: 'Có Lỗi',
  'TRESPASSING EVENT': 'Xâm nhập vùng',
  'LOITERING EVENT': 'Đi luẩn quẩn',
  'TRIPWIRE EVENT': 'Vượt đường kẻ',
};

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return VI_Dict[value] || value;
  }
}
