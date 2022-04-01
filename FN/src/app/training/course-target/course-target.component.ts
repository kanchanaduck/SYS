import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import axios from 'axios';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-course-target',
  templateUrl: './course-target.component.html',
  styleUrls: ['./course-target.component.scss']
})
export class CourseTargetComponent implements OnInit {
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable

  course_no: string;
  course: any = {};
  courses: any = [];
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }

  constructor(
      private modalService: NgbModal, config: NgbModalConfig, processbar: NgbProgressbarConfig, 
      private service: AppServiceService,
      private httpClient: HttpClient
  ) { 
    config.backdrop = 'static'; // popup
    config.keyboard = false;

    processbar.max = 1000;  // processbar
    processbar.striped = true;
    processbar.animated = true;
    processbar.type = 'primary';
  }

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
              {
                extend: 'csv',
                text: '<i class="far fa-file-excel"></i> Csv</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> Pdf</button>',
              },              
            ]
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };

    this.clear_data();
    this.get_courses();
    this.datatable();
  }

  async get_courses(){
    let self = this
    await axios.get(`${environment.API_URL}CourseMasters`, this.headers)
    .then(function(response){
      self.courses = response
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
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear().draw();
      dtInstance.destroy();
      this.dtTrigger.next();
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
      axios.get(`${environment.API_URL}CourseMasters/${self.course_no}`,self.headers)
        .then(function(response){
          self.course = response
          self.course.band_text = self.course.master_courses_bands.map(c => c.band).join(', ');
          console.log(self.course.band_text )
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
      self.datatable()      
    }
  }

  async datatable(){
    await this.service.gethttp('OtherData/GetCourseTarget?course_no=' + this.course_no)
    // await this.httpClient.get(`${environment.API_URL}OtherData/GetCourseTarget?course_no=${this.course_no}`)  
    .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;

        // Calling the DT trigger to manually render the table
        if (this.isDtInitialized) 
        {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        } 
        else 
        {
          this.isDtInitialized = true
          this.dtTrigger.next();
        }
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];

        // Calling the DT trigger to manually render the table
        if (this.isDtInitialized) 
        {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        } 
        else 
        {
          this.isDtInitialized = true
          this.dtTrigger.next();
        }
      }); 
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}

export interface PeriodicElement {
  emp_no: string;
  status_eng: string;
  firstname_en: string;
  lastname_en: string;
  posn_name: string;
  dept_abb: string;
  div_abb: string;
  status_th: string;
  firstname_th: string;
  lastname_th: string;
}