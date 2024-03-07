import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'datetime',
})
export class DateTimeFormatPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    const fmt = args[0];
    return moment(value, 'ddd, DD MMM YYYY H:mm:ss').format(fmt);
  }
}
