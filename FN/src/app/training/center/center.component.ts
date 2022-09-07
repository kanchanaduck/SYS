import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AppServiceService } from 'src/app/app-service.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Settings } from 'src/app/settings';
import { SelectionModel } from '@angular/cdk/collections';
@Component({
  selector: 'app-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.scss']
})
export class CenterComponent implements OnInit {

  centers: any= [];
  center: any = {};
  setting: any = {};
  errors: any;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;
  is_center: boolean = false;
  extend: any = {};

  constructor(private service: AppServiceService, private httpClient: HttpClient) { }

  ngOnInit(): void {

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set dept_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code

    this.check_is_center()

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
      "processing": true,
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
                    title: 'HRGIS/Training: Center',
                    filename: 'HRGIS_Training_Center',
                    exportOptions: {
                      columns: [ 0,1,2,3,4,5,6,7 ]
                    },
                    text: '<i class="far fa-file-excel"></i> Excel</button>',
                },
            ]
          },
        ],
      },
      order: [ [0, 'asc']],
      /* columnDefs: [ {
        targets: [ 0 ],
        "orderable": false
      } ] ,*/

      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };


  this.get_centers()
  this.get_setting()
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  async get_centers(){
    await this.httpClient.get(`${environment.API_URL}Center`, Settings.headers)
    .subscribe((response: any) => {
      this.centers = response;
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.clear().draw();
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      } 
      else {
        this.isDtInitialized = true
        this.dtTrigger.next();
      }
    });
  }

  async check_is_center() {
    let self = this
    await axios.get(`${environment.API_URL}Center/${this._emp_no}`,Settings.headers)
    .then(function (response) {
      self.is_center = true;
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  async save_center() {  
    let self = this
    await axios.post(`${environment.API_URL}Center`,this.center,Settings.headers)
    .then(function (response) {
      self.get_centers()
      self.reset_form_center()
      self.service.sweetalert_create()
    })
    .catch(function (error) {
      self.service.sweetalert_error(error)
    });
  }

  async delete_center(emp_no: string) { 
    let self =this
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to delete this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then(async (result) => {
      if (result.value) {
        await axios.delete(`${environment.API_URL}Center/${emp_no}`, Settings.headers)
        .then(function (response) {
          console.log(response)
          self.service.sweetalert_delete()
          self.get_centers()
        }) 
        .catch(function (error) {
          console.log(error)
          self.service.sweetalert_error(error)
        })
      }
    })
  }

  async reset_form_center() { 
    this.center = {};
  }

  async fillEmpNo() { 
    if(this.center.emp_no.length>=6){
      this.get_employee()
    }
  }
   
  async get_employee() {
    let self =this
    await axios.get(`${environment.API_URL}Employees/${this.center.emp_no}`,Settings.headers)
    .then(function (response) {
      console.log(response)
      self.center = response
    }) 
    .catch(function (error) {
      console.log(error)
      self.reset_form_center()
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }) 
  }
  async get_setting() {  
    let self = this
    await axios.get(`${environment.API_URL}Center/Signature`, Settings.headers)
    .then(function (response:any) {
      self.setting.name = response.name
      self.setting.position = response.position
      self.setting.updated_at = response.updated_at
      self.setting.updated_by = response.updated_by
    })
    .catch(function (error) {
      self.service.sweetalert_error(error)
    });
  }

  async save_setting() {  
    let self = this
    await axios.put(`${environment.API_URL}Center/Signature/1`,this.setting,Settings.headers)
    .then(function (response) {
      self.service.sweetalert_edit()
    })
    .catch(function (error) {
      self.service.sweetalert_error(error)
    });
  }


  async find_date_end() {
    
    if(this.extend.course_no==undefined){
      return ;
    }
    
    let self = this
    await axios.get(`${environment.API_URL}Courses/${this.extend.course_no}`,Settings.headers)
    .then(function (response: any) {
      self.extend.date_end_get = new Date(response.date_end).toISOString().slice(0, 10);
      console.log(response.date_end)
      console.log(self.extend.date_end_get)
      var next_month = new Date(new Date(response.date_end).setMonth(new Date(response.date_end).getMonth() + 2))
      self.extend.date_end = next_month.toISOString().slice(0, 10);
    })
    .catch(function (error) {
      self.service.sweetalert_error(error)
    });
  }

  async extend_course() {  
    let self = this
    await axios.put(`${environment.API_URL}Courses/Extend/?course_no=${this.extend.course_no}&date_end=${this.extend.date_end}`,this.extend,Settings.headers)
    .then(function (response) {
      self.service.sweetalert_edit()
      self.clear_extend()
    })
    .catch(function (error) {
      self.service.sweetalert_error(error)
    });
  }

  async clear_extend(){
    this.extend = {}
  }

}


