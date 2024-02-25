import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Directive({
  selector: '[isLoading]',
})
export class LoadingDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() classNames: string = 'd-flex justify-content-center mt-5';

  @Input() colorClass: string = 'text-primary';

  @Input() set isLoading(isLoading: boolean) {
    this.viewContainer.clear();

    if (isLoading) {
      const loadingComponent =
        this.viewContainer.createComponent(LoadingComponent);
      loadingComponent.instance.colorClass = this.colorClass;
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
