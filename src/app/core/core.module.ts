import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';

const providers = [
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [...providers],
    };
  }
}
