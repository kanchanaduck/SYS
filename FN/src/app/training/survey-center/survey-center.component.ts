import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import {NgbCalendar, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service'

@Component({
  selector: 'app-survey-center',
  templateUrl: './survey-center.component.html',
  styleUrls: ['./survey-center.component.scss'],
  providers: [DatePipe] 
})

@Injectable()
export class SurveyCenterComponent implements OnInit {
  dtOptions: any = {};
  
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
  survey: any = {};
  surveys: any = [];
  alerts: any;
  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;
  is_center: boolean = false;
  is_committee: boolean = false;
  
  constructor(
    private service: AppServiceService, 
    private httpClient: HttpClient,
    public datepipe: DatePipe
  ) { }

  ngOnInit(): void {

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set dept_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code

    this.check_is_center()
    this.check_is_committee()

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
      filter:{
        "dom":{
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-left"
          },
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
            text: '<i class="fas fa-cloud-download-alt"></i> Download',
            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="far fa-file-excel"></i> Excel',
                },
                {
                    text: '<i class="far fa-file-excel"></i> History',
                    action: function ( e, dt, node, config ) {
                       alert('เอาไว้ดาวน์โหลดประวัติการสอนค่าาา')
                    }
                },
            ]
          },
        ],
      },
      order: [[0, 'desc']],
      columnDefs: [ 
        {
          targets: [ 5],
          orderable: false 
        } 
      ],

      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };

    this.get_surveys()

  }

  close(alert: any) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.survey.org_code = response._org_code
        /* if (response.role.toUpperCase() == "COMMITTEE") {
          self.dtOptions.columnDefs = [ 
            {
              targets: [ 8 ],
              visible: true
            }
          ]
        } */
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
      });

      
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

  async get_surveys(){
    let self = this
    await this.httpClient.get(`${environment.API_URL}Survey`, this.headers)
    .subscribe((response: any) => {
      self.surveys = response;
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
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

  onDateSelectTo(event) {
    console.log('onDateSelectTo: ', event);
    /* this.survey.date_start = `${event.year}-${event.month}-${event.day}`;  */
  }
  onDateSelectFrom(event) {
    console.log('onDateSelectFrom: ', event);
    /* this.survey.date_end = `${event.year}-${event.month}-${event.day}`;  */
  } 

  async reset_form_survey(){
    this.survey = {};
  }

  async save_survey() {  
    let self = this
    alert(this.survey.length)
    await axios.post(`${environment.API_URL}Survey`,this.survey,this.headers)
    .then(function (response) {
      self.get_surveys()
      self.reset_form_survey()
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: "Success",
        showConfirmButton: false,
        timer: 2000
      })
    })
    .catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    });
  }

  async get_survey(year: string) { 
    let self = this
    alert(year)
    await axios.get(`${environment.API_URL}Survey/${year}`,this.headers)
    .then(function (response) {
      self.survey = response
      self.survey.date_start = self.datepipe.transform(self.survey.date_start,"yyyy-MM-dd")
      self.survey.date_end = self.datepipe.transform(self.survey.date_end,"yyyy-MM-dd")
      console.log(self.survey)
    })
    .catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    });
  }

  async delete_survey(year: string) { 
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
        await axios.delete(`${environment.API_URL}Survey/${year}`, this.headers)
        .then(function (response) {
          console.log(response)
          self.get_surveys()
        }) 
        .catch(function (error) {
          console.log(error)
          Swal.fire({
            icon: 'error',
            title: error.response.status,
            text: error.response.data
          })
        })
      }
    })
  }


  

}
