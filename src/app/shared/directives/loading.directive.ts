import {
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Input,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Directive({
  selector: '[isLoading]',
})
export class LoadingDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set isLoading(isLoading: boolean) {
    this.viewContainer.clear();

    if (isLoading) {
      this.viewContainer.createComponent(LoadingComponent);
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
