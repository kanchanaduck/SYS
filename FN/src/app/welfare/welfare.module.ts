import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { WelfareComponent } from './welfare/welfare.component';
import { LockerComponent } from './locker/locker.component';
import { DataTablesModule } from 'angular-datatables';

const routes: Routes = [
  { path: '', component: WelfareComponent },
  { path: 'locker', component: LockerComponent }
]

@NgModule({
  declarations: [
    WelfareComponent,
    LockerComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    DataTablesModule
  ]
})
export class WelfareModule { }
