import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import axios from 'axios';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  showErrorMessage: any;
  errorMessage: string = "";
  call: string = environment.call;

  constructor(private readonly fb: FormBuilder,
    private router: Router,) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmpassword: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  async btnsubmit() {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const params = {
        "username": this.form.value.username,
        "password": this.form.value.password,
        "confirmpassword": this.form.value.confirmpassword
      };

      const response = await instance.post("/Account/Registers", params);
      console.log("response: ", response);

      this.router.navigate(['/authentication/signin']);

      return response
    } catch (error) {
      console.log('RES ERROR: ', error.response);
      var result;
      if (error.response.data.errors) {
        if (error.response.data.errors.confirmpassword)
          result = error.response.data.errors.confirmpassword[0];
        else if (error.response.data.errors.password)
          result = error.response.data.errors.password[0];
        else
          result = error.response.data.errors.status;
      } else {
        result = error.response.data.status == 409 ? environment.text.duplication : error.response.data.status;
      }
      // console.log(result);
      
      this.errorMessage = result;
      this.showErrorMessage = true;

      localStorage.clear();
    }
  }

}
