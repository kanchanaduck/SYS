import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbDate, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';
import axios from 'axios';


@Component({
  selector: 'app-register-data',
  templateUrl: './register-data.component.html',
  styleUrls: ['./register-data.component.scss']
})
export class RegisterDataComponent implements OnInit {

  
  headers: any = {
    headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false

  
  dtOptionsOther: any = {};
  dtTriggerOther: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElementOther: DataTableDirective;
  isDtInitializedOther: boolean = false

  is_committee: boolean;
  _getjwt: any;
  _emp_no: any;
  _org_code: any;
  _org_abb: any;
  data_grid: any[];
  course_no: any;
  response: any;
  course: any={};
  courses: any;
  committee: any;
  committee_org_code: string;
  has_committee: boolean;
  data_grid_other: any;

  v_regis: number = 0;
  v_wait: number = 0;
  v_total: number = 0;
  arr_band: any;
  committee_org_abb: any;


  constructor(private route: ActivatedRoute, private service: AppServiceService) { }

  ngOnInit(): void {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this.check_is_committee()
    this.get_committee_of_emp_no()
  }
  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        this.get_courses()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
        this.get_courses()
      }); 

  }

  async get_committee_of_emp_no(){
    let self = this
    await axios.get(`${environment.API_URL}Stakeholder/Committee/Belong/${this._emp_no}`, this.headers)
    .then(function (response) {
      self.committee = response
      self.committee_org_code = self.committee.org_code
      self.committee_org_abb = self.committee.organization.org_abb
      self.has_committee = true;
    })
    .catch(function (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }); 
  }

  async get_course() {
    let self = this

    if(this.course_no==null)
    {
      return false;
    }
    else
    {
      self.data_grid = [];
      self.data_grid_other = [];
      axios.get(`${environment.API_URL}Courses/Trainers/?course_no=${self.course_no}`,self.headers)
        .then(function(response: any){
          self.course = response.courses
          self.arr_band = response.courses.courses_bands
          let trainers = response.trainers
          if(self.course.trainer_text!="" || self.course.trainer_text!=null ){
            self.course.trainer_text = self.course.trainer_text
          }
          else{
            if(trainers.length>0){
              self.course.trainer_text = trainers.map(c => c.display_name).join(', ');
            }
            else{
              self.course.trainer_text = "-"
            }
          }

          let bands = self.arr_band
          if(bands.length>0){
            self.course.band_text = bands.map(c => c.band).join(', ');
          }
          else{
            self.course.band_text = "-"
          }
          self.fnGet()
          self.datatable()

          

        })
        .catch(function(error){
          Swal.fire({
            icon: 'error',
            title: error.response.status,
            text: error.response.data
          })
          self.course = {};
          return false;
      });      
    }
  }

  async redirect(){
    if(this.course_no==null){
     return; 
    }
    location.href=`training/register-data/${this.course_no}`
  }

async get_courses(){
  let self = this
  await axios.get(`${environment.API_URL}Courses`, this.headers)
  .then(function(response){
    self.courses = response
    self.route.params.subscribe(params => {
      self.course_no = params['course_no'];
    });
    self.get_course()
  })
  .catch(function(error){

  });
}

custom_search_course_fn(term: string, item: any) {
  term = term.toLowerCase();
  return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
}

async clear_data() {
  this.course = {};
  this.data_grid = [];
  this.data_grid_other = [];
}

  async datatable(){
    this.dtOptions = {
      destroy: true,
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        paginate: {
          next: '<i class="icon ion-ios-arrow-forward"></i>', // or '→'
          previous: '<i class="icon ion-ios-arrow-back"></i>' // or '←' 
        }
      },
      filter: {
        "dom": {
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-left"
          },
        }
      },
      buttons: {
        "dom": {
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
            extend: 'pageLength',
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
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            buttons: [
              {
                extend: 'excel',
                text: '<i class="far fa-file-excel"></i> Excel</button>',
              }, 
              /* {
                extend: 'csv',
                text: '<i class="far fa-file-excel"></i> Csv</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> Pdf</button>',
              }, */
            ]
          },
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
      order: [[0, 'asc']],
    };
    this.dtOptionsOther = {
      destroy: true,
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        paginate: {
          next: '<i class="icon ion-ios-arrow-forward"></i>', // or '→'
          previous: '<i class="icon ion-ios-arrow-back"></i>' // or '←' 
        }
      },
      filter: {
        "dom": {
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-left"
          },
        }
      },
      buttons: {
        "dom": {
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
            extend: 'pageLength',
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
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            buttons: [
              {
                extend: 'excel',
                text: '<i class="far fa-file-excel"></i> Excel</button>',
              },
            ]
          }
        ],
      },
      container: "#example2_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
    }; 
  }

  async fnGet() {

    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.clear().draw();
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }

    if (this.isDtInitializedOther) {
      this.dtElementOther.dtInstance.then((dtInstance1: DataTables.Api) => {
        dtInstance1.clear().draw();
        dtInstance1.destroy();
        this.dtTriggerOther.next();
      });
    }



    await this.service.gethttp(`Register/YourOther/${this.course_no}/${this.committee_org_code}`)
      .subscribe((response: any) => {
        this.data_grid = response.your;
        this.data_grid_other = response.other;

        console.log(this.dtElement);
        console.log(this.dtElementOther);

        // Calling the DT trigger to manually render the table
        if (this.isDtInitialized) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
            this.isDtInitialized = true
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        } else {
          this.isDtInitialized = true
          this.dtTrigger.next();
        }

        if (this.isDtInitializedOther) {
          this.dtElementOther.dtInstance.then((dtInstance1: DataTables.Api) => {
            dtInstance1.clear().draw();
            dtInstance1.destroy();
            this.dtTriggerOther.next();
          });
        } else {
          this.isDtInitializedOther = true
          this.dtTriggerOther.next();
        }

      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
        this.data_grid_other = [];
      });

      await this.service.gethttp(`Register/${this.course_no}`)
      .subscribe((response: any) => {
        this.response = response
        this.v_regis = this.response.filter(x => x.last_status != environment.text.wait).length;
        this.v_wait = this.response.filter(x => x.last_status == environment.text.wait).length;
        this.v_total = this.response.length;
    }, (error: any) => {
        console.log(error);
      });
  }
  

}
