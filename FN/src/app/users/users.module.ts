import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { DataTablesModule } from 'angular-datatables';
import { UsersComponent } from './users/users.component';
import { EmployeeMatchUsersComponent } from './employee-match-users/employee-match-users.component';
import { AdministratorsComponent } from './administrators/administrators.component';

const routes: Routes = [
  { path: '', component: UsersComponent },
  { path: 'administrators', component: AdministratorsComponent, data: { title: 'Administrators', active: true } },
  { path: 'employee-match-users', component: EmployeeMatchUsersComponent, data: { title: 'Employee match users', active: true } },
  { path: 'administrators', component: AdministratorsComponent, data: { title: 'Administrators', active: true } },
  { path: 'employee-match-users', component: EmployeeMatchUsersComponent, data: { title: 'Employee match users', active: true } },
  { path: 'administrators', component: AdministratorsComponent, data: { title: 'Administrators', active: true } },
  { path: 'employee-match-users', component: EmployeeMatchUsersComponent, data: { title: 'Employee match users', active: true } },
]

@NgModule({
  declarations: [
    UsersComponent,
    EmployeeMatchUsersComponent,
    AdministratorsComponent
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class UsersModule { }
