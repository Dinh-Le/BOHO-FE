import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { anonymous, isAuthenticated } from '@app/guards';

const routes: Routes = [
  {
    path: '',
    // canActivate: [isAuthenticated],
    component: ContentLayoutComponent,
    children: [
      {
        path: 'monitor',
        loadChildren: () =>
          import('@modules/monitor/monitor.module').then(
            (m) => m.MonitorModule
          ),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('@modules/search/search.module').then((m) => m.SearchModule),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('@modules/reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('@modules/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: 'manage',
        loadChildren: () =>
          import('@modules/manage/manage.module').then((m) => m.ManageModule),
      },
      {
        path: 'alert',
        loadChildren: () =>
          import('@modules/alert/alert.module').then((m) => m.AlertModule),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [anonymous],
    component: AuthLayoutComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
