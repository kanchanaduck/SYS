import { NgModule } from '@angular/core';
import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { RouterModule } from '@angular/router';
import { UtilitiesSidebarComponent } from './utilities-sidebar/utilities-sidebar.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    RouterModule,
    CommonModule
  ],
  declarations: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent,
  ],
  exports: [
    ComponentsSidebarComponent,
    UtilitiesSidebarComponent
  ]
})

export class SharedModule { }