import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { DataTablesModule } from 'angular-datatables';

import { ManualComponent } from './manual/manual.component';


const routes: Routes = [
  { path: '', component: ManualComponent },
  // { path: 'administrators', component: AdministratorsComponent, data: { title: 'Administrators', active: true } },
]

@NgModule({
  declarations: [
    ManualComponent,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class ManualModule { }
