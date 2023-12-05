import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberToString' })
export class NumberToStringPipe implements PipeTransform {
  transform(value: number, ...args: any[]) {
    return value.toString();
  }
}
