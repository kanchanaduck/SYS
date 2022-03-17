import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AppServiceService } from 'src/app/app-service.service';

@Component({
  selector: 'app-course-map',
  templateUrl: './course-map.component.html',
  styleUrls: ['./course-map.component.scss']
})
export class CourseMapComponent implements OnInit {

  course_map: any = [];
  table_header: any = [];
  employed_status: string = "Employed";
  org_code: string;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  departments: any;
  _div_code: any;
  _dept_code: any;
  _getjwt: any;
  _emp_no: any;
  is_center: boolean = false;



  constructor(private service: AppServiceService, private httpClient: HttpClient)  { }

  ngOnInit(): void {

    this.dtOptions = {
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        paginate: {
          next: '<i class="icon ion-ios-arrow-forward"></i>', // or '→'
          previous: '<i class="icon ion-ios-arrow-back"></i>' // or '←' 
        }
      },
      /* "scrollX": true,
      scrollCollapse: true,
      fixedColumns:   {
        left: 3
      }, */
      buttons: {
        "dom":{
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-right"
          },
          "button": {
            tag: "button",
            className: "btn btn-outline-indigo btn-sm"
          },
        },
        "buttons": [
          {
            extend:'pageLength',
          },
          {
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            buttons: [
              {
                  extend: 'excel',
                  text: '<i class="far fa-file-excel"></i> Excel</button>',
              },
            ]
          },
        ],
      },
      order: [ [0, 'asc'],[2, 'desc'], [1, 'asc']], 
      columnDefs: [ 
        {
          targets: [ 'nosort' ],
          orderable: false 
        },
      ],  
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };


    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this._dept_code = this._getjwt.user.dept_code; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set emp_no
    this.org_code = this._dept_code
    
    this.get_course_map()
    this.get_departments()
  }

  /* ngAfterViewInit(): void {
    this.dtTrigger.next();
  } */

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  custom_search_org_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.org_code.toLowerCase().indexOf(term) > -1 ||  item.org_abb.toLowerCase().indexOf(term) > -1 ||item.org_abb.toLowerCase() === term;
  }

  group_by_parent_org_code_fn = (item) => item.parent_org_code;
  group_value_parent_org_code_fn = (_: string, children: any[]) => ({ org_abb: children[0].parent_org.org_abb, org_code: children[0].parent_org.org_code });
  
  compare_org = (item, selected) => {
    console.log(item)
    console.log(selected)
    if (item.org_code && selected) {
      return item.org_code === selected;
    }
    return false;
  };


 


  async get_course_map(){
    let self = this
    
    self.course_map = [];
    self.table_header = [];
    // await this.httpClient.get(`${environment.API_URL}Employees/Course/${self.org_code}/${self.employed_status}`, this.headers)
    await this.httpClient.get(`${environment.API_URL}OtherData/course_map/${self._div_code}/${self._dept_code}/${self.employed_status}`, this.headers)
    .subscribe((response: any) => {
    self.course_map = [];
    self.table_header = [];
    self.course_map = response; 
    self.table_header = Object.keys(response[0]);

    const [,,,,,,,,, ...rest] = self.table_header;
    self.table_header = rest
    console.log(rest)

    console.log(response[0])
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.clear().draw();
          this.isDtInitialized = true
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      } 
      else {
        this.isDtInitialized = true
        this.dtTrigger.next();
      }
    },
    (error: any) => {
      console.log(error);
    });
  }

  async get_departments() {
    let self = this
    await axios.get(`${environment.API_URL}Organization/Level/Department/Parent`, this.headers)
    .then(function (response) {
      self.departments = response
    })
    .catch(function (error) {
      //console.log(error)
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    });
  }

}
