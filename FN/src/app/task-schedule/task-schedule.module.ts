import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { DataTablesModule } from 'angular-datatables';

import { TaskScheduleComponent } from './task-schedule/task-schedule.component';
import { AdministratorsComponent } from './administrators/administrators.component';
import { CloseCourseComponent } from './close-course/close-course.component';

const routes: Routes = [
  { path: '', component: TaskScheduleComponent },
  { path: 'hrms', component: AdministratorsComponent, data: { title: 'HRMS', active: true } },
  { path: 'close-course', component: CloseCourseComponent, data: { title: 'Close course', active: true } },
]


@NgModule({
  declarations: [
    TaskScheduleComponent,
    AdministratorsComponent,
    CloseCourseComponent 
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class TaskScheduleModule { }
