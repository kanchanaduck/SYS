import { Component, Inject, OnInit } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  user_menu: any = [];

  constructor(@Inject('BASE_URL') baseUrl: string) {

  }



  ngOnInit(): void {
    this.user_menu = [
      {
        "menu_code": "US-01",
        "menu_name": "Maintenance",
        "parent_menu_code": "US",
        "description": null,
        "url": null,
        "spare1": null,
        "spare2": null,
        "update_date": "2021-09-15T00:00:00",
        "update_by": "014496",
        "children": [
          {
            "menu_code": "US-01-00",
            "menu_name": "Administrators",
            "parent_menu_code": "US-01",
            "description": null,
            "url": "administrators",
            "spare1": null,
            "spare2": null,
            "update_date": "2021-09-15T00:00:00",
            "update_by": "014496",
            "children": [
            ]
          },
          {
            "menu_code": "US-01-00",
            "menu_name": "Employee match users",
            "parent_menu_code": "US-01",
            "description": null,
            "url": "employee-match-users",
            "spare1": null,
            "spare2": null,
            "update_date": "2021-09-15T00:00:00",
            "update_by": "014496",
            "children": [
            ]
          },
        ]
      },
      {
        "menu_code": "US-02",
        "menu_name": "Report",
        "parent_menu_code": "US",
        "description": null,
        "url": null,
        "spare1": null,
        "spare2": null,
        "update_date": "2021-09-15T00:00:00",
        "update_by": "014496",
        "children": [
          {
            "menu_code": "US-01-00",
            "menu_name": "Nothing",
            "parent_menu_code": "US-01",
            "description": null,
            "url": "nothing",
            "spare1": null,
            "spare2": null,
            "update_date": "2021-09-15T00:00:00",
            "update_by": "014496",
            "children": [
            ]
          }
        ]
      }
    ]

/* 
    axios.post<Employee[]>('http://cptsvs531:1000/middleware/oracle/hrms', 
    {
      "command": "SELECT * FROM ADMIN.v_emp_data_all_cpt "+
                "WHERE dept_code in ('2230')  "+
                "ORDER BY div_code, dept_code"
    })
    .then((response) => {
      // this.employees = response.data;
    })
    .catch((error) => {
      console.error(error);
    }) */


  }

}