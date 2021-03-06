import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-survey-approve',
  templateUrl: './survey-approve.component.html',
  styleUrls: ['./survey-approve.component.scss']
})
export class SurveyApproveComponent implements OnInit {
  file: any;
  fileName: any;
  nameFile: any;

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

  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;
  is_center: boolean = false;
  is_committee: boolean = false;
  org_code_course: any;
  year: any;

  employees: any=[];
  courses: any;
  survey_details: any;

  constructor(
    private route: ActivatedRoute, 
    private service: AppServiceService, 
    private httpClient: HttpClient,
  ) { }

  ngOnInit(): void {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set dept_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code
  
    this.check_is_center()
    this.check_is_committee()

    this.route.params.subscribe(params => {
      this.org_code_course = params['course_owner'];
      this.year = params['year'];
    });


    this.dtOptions = {
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        paginate: {
          next: '<i class="icon ion-ios-arrow-forward"></i>', // or '???'
          previous: '<i class="icon ion-ios-arrow-back"></i>' // or '???' 
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
               alert('???????????????????????????????????????????????????????????????????????????????????????????????????')
            }
          },
        ],
      },
      order: [[0, 'desc']],
      columnDefs: [ 
        {
          targets: [ 'nosort' ],
          orderable: false 
        } 
      ],


      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };

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

  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.get_survey_detail()
        
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
      }); 
  }

  async get_survey_detail() {
    let self = this
    await this.service.gethttp(`Survey/Detail/Year/${this.year}/Org/${this._org_code}/For/${this.org_code_course}`)
      .subscribe((response: any) => {
        console.log(response)
        self.employees = response.employees
        self.courses = response.courses
        self.survey_details = response.survey_details
        console.log( self.survey_details)
        // self.match_course("005645","ACC-001")
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
      }); 
  }

  match_course(emp_no, course_no){
console.log(this.survey_details)
    const newArray = this.survey_details.find(
      x => x.emp_no==emp_no && x.course_no==course_no
    )
    console.log(newArray.month)
    return newArray.month
    // return "Jan"
  }

  chooseFile(e: any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.file = e.target.files[0];
      this.fileName = e.target.files[0].name;
      // console.log(this.file);
      // console.log(this.fileName);
      this.nameFile = this.fileName;
    }
  }



}