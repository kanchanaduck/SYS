import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthorizeGuard } from 'src/api-authorization/authorize.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthorizeInterceptor } from 'src/api-authorization/authorize.interceptor';

const routes: Routes = [
  { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'ui-elements', loadChildren: () => import('./ui-elements/ui-elements.module').then(m => m.UiElementsModule) },
  { path: 'form', loadChildren: () => import('./form/form.module').then(m => m.FormModule) },
  { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsDemoModule) },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: 'welfare', loadChildren: () => import('./welfare/welfare.module').then(m => m.WelfareModule) },
  { path: 'users', loadChildren: () => import('./users/users.module').then(m => m.UsersModule), data: { title: 'User management', active: true } },
  { path: 'menus', loadChildren: () => import('./menus/menus.module').then(m => m.MenusModule), data: { title: 'Menu', active: true } },
  { path: 'employee', loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule), data: { title: 'Employee', active: true } },
  { path: 'training', loadChildren: () => import('./training/training.module').then(m => m.TrainingModule), data: { title: 'Training', active: true } },
  { path: '**', redirectTo: 'general-pages/page-404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
