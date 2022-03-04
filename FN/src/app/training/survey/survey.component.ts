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
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
  providers: [DatePipe] 
})
export class SurveyComponent implements OnInit {

  constructor(
    private service: AppServiceService, 
    private httpClient: HttpClient,
    public datepipe: DatePipe
  ) { }

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
  link: string;


  ngOnInit(): void {

  this._getjwt = this.service.service_jwt();  // get jwt
  this._emp_no= this._getjwt.user.emp_no; // set emp_no
  this._div_code = this._getjwt.user.div_code; // set dept_code
  this._dept_code = this._getjwt.user.dept_code; // set dept_code

  // this.check_is_center()
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
            extend: 'copy',
            text: '<i class="fas fa-copy"></i> Copy</button>',
          },
          {
            extend: 'print',
            text: '<i class="fas fa-print"></i> Print</button>',
          },
          {
            text: '<i class="far fa-file-excel"></i> History',
            action: function ( e, dt, node, config ) {
               alert('เอาไว้ดาวน์โหลดประวัติการสอนค่าาา')
            }
          },
        ],
      },
      order: [[0, 'desc']],
      columnDefs: [ 
        {
          targets: [ 4, 5 ],
          orderable: false 
        } 
      ],


      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };
  }

  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.survey.org_code = response.org_code
        console.log(self.survey.org_code);
        self.get_surveys()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
      }); 
  }


  
  async get_surveys(){
    let self = this
    console.log(this._org_code)
    await this.httpClient.get(`${environment.API_URL}Survey/`, this.headers)
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

  async download_survey(year, org_code) {
    this.link = `${environment.API_URL}Survey/Excel/Year/${year}/Org/${this._org_code}/For/${org_code}`;
    location.href=this.link 
    // location.href=`${environment.API_URL}Survey/Excel/Year/${year}/Org/${this._org_code}/For/${org_code}`
    /* let self = this
    await axios.get(`${environment.API_URL}Survey/Excel/Year/${year}/Org/${this._org_code}/For/${org_code}`,this.headers)
    .then(function (response) {
      location.href=response
    })
    .catch(function (error) {
      console.log(error);
    }); */
  }

}
