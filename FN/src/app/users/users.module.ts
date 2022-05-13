import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { DataTablesModule } from 'angular-datatables';

import { UsersComponent } from './users/users.component';


const routes: Routes = [
  { path: '', component: UsersComponent },
  // { path: 'administrators', component: AdministratorsComponent, data: { title: 'Administrators', active: true } },
]

@NgModule({
  declarations: [
    UsersComponent,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class UsersModule { }
