import { Component, Inject, OnInit } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  employees: any = [];

  constructor(@Inject('BASE_URL') baseUrl: string) {

  }



  ngOnInit(): void {


    axios.post('http://cptsvs531:1000/middleware/oracle/hrms', 
    {
      "command": `SELECT * FROM cpt_employees 
                WHERE dept_code in ('2230') and employed_status='EMPLOYED'
                ORDER BY div_code, dept_code, emp_no`
    })
    .then((response) => {
      this.employees = response.data;
    })
    .catch((error) => {
      console.error(error);
    })


  }

}