import { Pipe, PipeTransform } from '@angular/core';

const VI_Dict: {
  [key: string]: string;
} = {
  ONLINE: 'TỐT',
  OFFLINE: 'MẤT KẾT NỐI',
  ERROR: 'CÓ LỖI',
};

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    return VI_Dict[value] || value;
  }
}
