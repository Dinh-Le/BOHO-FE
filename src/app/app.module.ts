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
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { sidebarReducer } from './state/sidebar.reducer';
import { TopBarComponent } from './layout/top-bar/top-bar.component';
import { DataModule } from './data/data.module';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';


@NgModule({
  imports: [
    // angular modules
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,

    // 3rd party module
    NgxLoadingModule.forRoot({}),
    FontAwesomeModule,

    StoreModule.forRoot({ sidebar: sidebarReducer }),

    // core & shared
    CoreModule.forRoot(),
    DataModule.forRoot(),
    SharedModule,

    // app module
    AppRoutingModule,
    NgbToastModule,
  ],
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    ContentLayoutComponent,
    AuthLayoutComponent,
    SidebarComponent,
    TopBarComponent,
  ],
})
export class AppModule {
  constructor(faIconLibrary: FaIconLibrary) {
    faIconLibrary.addIconPacks(fas);
  }
}
