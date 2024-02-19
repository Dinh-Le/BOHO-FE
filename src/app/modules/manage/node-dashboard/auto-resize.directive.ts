import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[autoResize]',
})
export class AutoResizeDirective implements OnInit {
  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    const el = this.elRef.nativeElement as HTMLElement;
    const { height } = el.getBoundingClientRect();

    el.style.height = height + 'px';
  }
}
