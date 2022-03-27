import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import axios from 'axios';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-history',
  templateUrl: './course-history.component.html',
  styleUrls: ['./course-history.component.scss']
})
export class CourseHistoryComponent implements OnInit {
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
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


  @ViewChild("txtcourse_no") txtcourse_no;

  constructor(private modalService: NgbModal, config: NgbModalConfig, private service: AppServiceService) { 
    config.backdrop = 'static'; // popup
    config.keyboard = false;
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
              /* {
                extend: 'csv',
                text: '<i class="far fa-file-excel"></i> CSV</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> PDF</button>',
              },   */            
            ]
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      rowGroup: {
        dataSrc: [ 1 ]
      },
      columnDefs: [ {
        targets: [ 1 ],
        visible: false
      }]
    };

    this.get_courses()
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
          self.get_course_attendee()
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

  async get_course_attendee() {
    let self = this

    if(this.course_no==null)
    {
      return false;
    }
    else
    {
      self.data_grid = [];
      await this.service.gethttp('OtherData/GetCountAttendee?course_no=' + this.course_no)
      .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;

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
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
      });    
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}