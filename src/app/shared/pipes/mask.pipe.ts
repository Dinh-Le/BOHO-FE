import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mask' })
export class MaskPipe implements PipeTransform {
  transform(value: string, ...args: any[]) {
    return '*'.repeat(value.length);
  }
}
