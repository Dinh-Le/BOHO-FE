import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from '@app/core.module';
import { SharedModule } from '@shared/shared.module';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NgxLoadingModule } from 'ngx-loading';

@NgModule({
  imports: [
    // angular modules
    BrowserModule,

    NgxLoadingModule.forRoot({}),

    // core & shared
    CoreModule,
    SharedModule,

    // app module
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    ContentLayoutComponent,
    AuthLayoutComponent,
    SidebarComponent
  ]
})
export class AppModule { }
