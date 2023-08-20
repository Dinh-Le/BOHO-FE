import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ContentLayoutComponent } from "./layout/content-layout/content-layout.component";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";

const routes: Routes = [
    {
        path: '',
        component: ContentLayoutComponent,
        children: [
            {
                path: 'monitor',
                loadChildren: () => import('@modules/monitor/monitor.module').then(m => m.MonitorModule)
            },
            {
                path: 'search',
                loadChildren: () => import('@modules/search/search.module').then(m => m.SearchModule)
            },
            {
                path: 'reports',
                loadChildren: () => import('@modules/reports/reports.module').then(m =>m.ReportsModule)
            },
            {
                path: 'settings',
                loadChildren: () => import('@modules/settings/settings.module').then(m => m.SettingsModule)
            }
        ]
    },
    {
        path: 'login',
        component: AuthLayoutComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { }