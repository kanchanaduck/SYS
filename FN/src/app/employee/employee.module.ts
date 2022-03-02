import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { DataTablesModule } from 'angular-datatables';

import { EmployeeComponent } from './employee/employee.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ManpowerComponent } from './manpower/manpower.component';
import { EmployeeDataComponent } from './employee-data/employee-data.component';
import { EmployeeDeptDataComponent } from './employee-dept-data/employee-dept-data.component';
import { EmployeeEducationDataComponent } from './employee-education-data/employee-education-data.component';
import { EmployeePromotionDataComponent } from './employee-promotion-data/employee-promotion-data.component';

const routes: Routes = [
  { path: '', component: EmployeeComponent },
  {
    path: 'manpower', component: ManpowerComponent,
    data: {
      title: 'manpower', active: true
    }
  },
]

@NgModule({
  declarations: [
    EmployeeComponent,
    ManpowerComponent,
    EmployeeDataComponent,
    EmployeeDeptDataComponent,
    EmployeeEducationDataComponent,
    EmployeePromotionDataComponent,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ]
})
export class EmployeeModule { }
