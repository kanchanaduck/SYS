import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DataTablesModule } from 'angular-datatables';
import { MenusComponent } from './menus/menus.component';

const routes: Routes = [
  { path: '', component: MenusComponent },
  /* { path: 'approve-mgr', component: ApproveMgrComponent, data: { title: 'Mgr. approve trainee', active: true } }, */
]

@NgModule({
  declarations: [
    MenusComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DataTablesModule,
    RouterModule.forChild(routes),
  ]
})
export class MenusModule { }