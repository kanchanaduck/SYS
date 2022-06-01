import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service'
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-stakeholder',
  templateUrl: './stakeholder.component.html',
  styleUrls: ['./stakeholder.component.scss']
})
export class StakeholderComponent implements OnInit {

  dtOptions: any = {};
  closeResult = '';
  stakeholders: any = [];
  stakeholder: any = {};
  committees: any = [];
  committee: any = {};
  approver: any = {};
  approvers: any = [];
  
  departments: any;
  employees: any = [];
  employees_j4up: any = [];
  errors: any;
  formData: any = [];
  more_approver: string;

  is_center: boolean = false;

  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;

  constructor(
    private service: AppServiceService, 
    private httpClient: HttpClient
  ) { }

  ngOnInit(): void {

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set dept_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code

    this.check_is_center()
    this.get_stakeholders();
    this.get_departments();
    
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
                text: '<i class="far fa-file-alt"></i> Report</button>',
                action: function ( e, dt, node, config ) {
                  window.open("http://cptsvs52t/HRGIS_REPORT/Training/Stakeholder","_blank")
                }
              }
              /* {
                extend: 'excelHtml5',
                filename: 'stakeholder',
                text: '<i class="far fa-file-excel"></i> Excel</button>',
                exportOptions: {
                  format: {
                    body: function(data, column, row) {
                      if (typeof data === 'string' || data instanceof String) {
                          data = data.replace(/<br\s*\/?>/ig, "\r\n");
                      }
                      return data;
                    }
                  }
                }
              } */
            ]
          },
        ],
      },
      order: [ [0, 'asc'],[2, 'desc'], [1, 'asc']],
      /* columnDefs: [ 
        {
          targets: [ 5 ],
          orderable: false 
        },
      ], */  
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };
  
 
  
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  custom_search_org_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.org_code.toLowerCase().indexOf(term) > -1 ||  item.org_abb.toLowerCase().indexOf(term) > -1 ||item.org_abb.toLowerCase() === term;
  }
  group_by_parent_org_code_fn = (item) => item.parent_org_code;
  group_value_parent_org_code_fn = (_: string, children: any[]) => ({ org_abb: children[0].parent_org.org_abb, org_code: children[0].parent_org.org_code });
  compare_org = (item, selected) => {
    if (item.org_code && selected) {
      return item.org_code === selected;
    }
    return false;
  };

  // async add_more_approver(){
  //   let self = this
  //   await axios.get(`${environment.API_URL}Employees/${this.more_approver}`,this.headers)
  //   .then(function (response) {
  //     self.employees_j4up.push(
  //       response
  //     );
  //   })
  //   .catch(function (error) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: error.response.status,
  //       text: error.response.data
  //     })
  //   });
  // }

  async get_stakeholders(){
    let self = this
    await this.httpClient.get(`${environment.API_URL}Stakeholder`, this.headers)
    .subscribe((response: any) => {
      self.stakeholders = response;
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

  async get_employees() {
    let self = this
    let org_code = self.stakeholder.org_code

    await axios.get(`${environment.API_URL}Employees/Organization/${org_code}/employed`,this.headers)
    .then(function (response) {
      self.employees = response


      const committees = self.stakeholder.stakeholders.filter(function(el){
        return el.role === "COMMITTEE"
      })

      if(committees.length>0){
        //console.log(committees)
        self.stakeholder.committees = [];
        committees.forEach(element => {
          self.stakeholder.committees.push(element.emp_no)
        });
      }
      else{
        //console.log("Committees = 0")
      }   


    })
    .catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    });
  }

  async get_employees_j4up() {
    let self = this
    let org_code = self.stakeholder.org_code
    await axios.get(`${environment.API_URL}Employees/Organization/${org_code}/j4up/employed`,this.headers)
    .then(function (response:any) {
      self.employees_j4up = []

      const approvers = self.stakeholder.stakeholders.filter(function(el){
        return el.role === "APPROVER"
      })

      //console.log(approvers);
      self.stakeholder.approvers = [];
      approvers.forEach(element => {
        console.log(element)
        self.employees_j4up.push({
          emp_no: element.emp_no,
          shortname_en: element.employee.shortname_en
        })
        console.log(self.employees_j4up)
        self.stakeholder.approvers.push(element.emp_no)
      });

      let diff = response.filter(a => !self.employees_j4up.map(b=>b.emp_no).includes(a.emp_no))
      diff.forEach(element => {
        self.employees_j4up.push({
          emp_no: element.emp_no,
          shortname_en: element.shortname_en
        })
      });
      console.log(self.employees_j4up)

    })
    .catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
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

  custom_search_name_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.emp_no.toLowerCase().indexOf(term) > -1 ||  item.shortname_en.toLowerCase().indexOf(term) > -1 ;
  }

  async get_stakeholder(org_code: any) {
    const self = this;
    if(org_code==null){
      self.reset_form_stakeholder()
      return;
    } 
    console.log(org_code)
    // self.stakeholder.org_code = org_code;
    // self.get_employees()
    // self.get_employees_j4up()
    await axios.get(`${environment.API_URL}Stakeholder/${org_code}`, this.headers)
      .then(function (response) {
        self.stakeholder = response
        self.get_employees();
        self.get_employees_j4up();
      })
      .catch(function (error) {
        self.service.sweetalert_error(error)
    });

    //console.log(self.stakeholder)
    //console.log(self.stakeholder.stakeholders)
    //console.log(self.stakeholder.stakeholders.length)

    // if(self.stakeholder.stakeholders.length>0){

    //   const committees = self.stakeholder.stakeholders.filter(function(el){
    //     return el.role === "COMMITTEE"
    //   })

    //   const approvers = self.stakeholder.stakeholders.filter(function(el){
    //     return el.role === "APPROVER"
    //   })


    //   if(approvers.length>0){
    //     //console.log(approvers);
    //     self.stakeholder.approvers = [];
    //     self.employees_j4up = []
    //     approvers.forEach(element => {
    //       console.log(element)
    //       self.employees_j4up.push({
    //         emp_no: element.emp_no,
    //         shortname_en: element.employee.shortname_en
    //       })
    //       console.log(self.employees_j4up)
    //       self.stakeholder.approvers.push(element.emp_no)
    //     });
    //   }
    //   else{
    //     //console.log("Approvers = 0")
    //   }

    //   if(committees.length>0){
    //     //console.log(committees)
    //     self.stakeholder.committees = [];
    //     committees.forEach(element => {
    //       self.stakeholder.committees.push(element.emp_no)
    //     });
    //   }
    //   else{
    //     //console.log("Committees = 0")
    //   }        
    // }

    this.check_is_center()

  }

  async check_is_center() {
    let self = this
    await axios.get(`${environment.API_URL}Center/${this._emp_no}`,this.headers)
    .then(function (response) {
      self.is_center = true;
    })
    .catch(function (error) {
      console.log(error);
    });
  } 

  async reset_form_stakeholder(){
    this.stakeholder = {};
    this.more_approver = null;
  }

  async save_stakeholders(){
    let self = this
    self.formData = [];
    //console.log("Committee: ", self.stakeholder.committees)
    //console.log("Approver: ", self.stakeholder.approvers)


    axios.get(`${environment.API_URL}Employees/${this.more_approver}`,this.headers)
    .then(function (response) {
      if(self.stakeholder.committees!==undefined){
        self.stakeholder.committees.forEach(element => {
          let c = {
            emp_no: element,
            org_code: self.stakeholder.org_code,
            role: 'COMMITTEE'
          }
          self.formData.push(c)
        });      
      }
  
      if(self.stakeholder.approvers!==undefined){
        self.stakeholder.approvers.forEach(element => {
          let a = {
            emp_no: element,
            org_code: self.stakeholder.org_code,
            role: 'APPROVER'
          }
          self.formData.push(a)
        });
      }
  
      if(self.more_approver!=null){
        self.formData.push({
          emp_no: self.more_approver,
          org_code: self.stakeholder.org_code,
          role: 'APPROVER'
        })
      }
      //console.log(self.formData)
  
      if(self.formData.length>0)
      {
        console.log("POST")
        axios.post(`${environment.API_URL}Stakeholder`,self.formData, self.headers)
        .then(function (response) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: "Success",
            showConfirmButton: false,
            timer: 2000
          })
          self.reset_form_stakeholder()
          self.get_stakeholders()
        })
        .catch(function (error) {
          self.service.sweetalert_error(error)
        });      
      }
      else
      {
        console.log("RESET")
        axios.post(`${environment.API_URL}Stakeholder/Reset/${self.stakeholder.org_code}`, [], self.headers)
        .then(function (response) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: "Success",
            showConfirmButton: false,
            timer: 2000
          })
          self.reset_form_stakeholder()
          self.get_stakeholders()
        })
        .catch(function (error) {
          self.service.sweetalert_error(error)
        });   
      }
      
      self.reset_form_stakeholder()
    })
    .catch(function (error) {
      console.log(error)
      Swal.fire({
        icon: 'error',
        title: "404",
        text: "Staff is not exist."
      })
    });


 

  }





}

