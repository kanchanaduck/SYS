import { Component, Inject, OnInit } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AppServiceService } from 'src/app/app-service.service';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  employees: any = [];
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  _getjwt: any;
  _emp_no: string;
  _dept_abb: string;
  is_j4: boolean;

  constructor(private service: AppServiceService, private httpClient: HttpClient) {

  }

  ngOnInit(): void {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this._dept_abb = this._getjwt.user.dept_abb; // set dept_abb
    this.check_is_j4()
    this.get_users()
  }

  async get_users(){
    let self = this
    await axios.get(`${environment.API_URL}Account`, this.headers)
    .then((response) => {
      this.employees = response;
      this.employees = this.employees.filter(e=>e.dept_abb == self._dept_abb)
      console.log(this.employees.length)
    })
    .catch((error) => {
      console.error(error);
    })
  }

  async check_is_j4(){
    await axios.get(`${environment.API_URL}Employee/CheckIsj4Up/${this._emp_no}`, this.headers)
    .then((response) => {
      this.is_j4 = true
    })
    .catch((error) => {
      console.error(error);
    })
  }

  reset_password(emp_no: string){
    axios.get(`${environment.API_URL}Account/ResetPassword/${emp_no}`, this.headers)
    .then((response) => {
      this.service.sweetalert_edit()
    })
    .catch((error) => {
      console.error(error);
    })
  }

}