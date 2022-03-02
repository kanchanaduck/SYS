import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApplicationPaths } from './api-authorization.constants';
import { HttpClientModule } from '@angular/common/http';


import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LoginMenuComponent } from './login-menu/login-menu.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';



@NgModule({
  declarations: [
    LoginMenuComponent,
    SigninComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule, 
    FormsModule,
    RouterModule.forChild(
      [
        { path: ApplicationPaths.Login, component: SigninComponent },
        { path: ApplicationPaths.Register, component: SignupComponent },
        /* { path: ApplicationPaths.Login, component: LoginComponent },
        { path: ApplicationPaths.LoginFailed, component: LoginComponent },
        { path: ApplicationPaths.LoginCallback, component: LoginComponent },
        { path: ApplicationPaths.LogOut, component: LogoutComponent },
        { path: ApplicationPaths.LoggedOut, component: LogoutComponent },
        { path: ApplicationPaths.LogOutCallback, component: LogoutComponent } */
      ]
    )
  ],
  exports: [LoginMenuComponent, SigninComponent, SignupComponent]
})
export class ApiAuthorizationModule { }
