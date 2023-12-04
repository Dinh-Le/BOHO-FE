import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectEntries' })
export class ObjectEntries implements PipeTransform {
  transform(value: any, ...args: any[]): [any, any][] {
    return Object.entries(value);
  }
}
