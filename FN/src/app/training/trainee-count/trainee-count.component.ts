import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import axios from 'axios';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-trainee-count',
  templateUrl: './trainee-count.component.html',
  styleUrls: ['./trainee-count.component.scss']
})
export class TraineeCountComponent implements OnInit {
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable

  date = new Date();
  @ViewChild("txtcourse_no") txtcourse_no;
  @ViewChild("txtdate_from") txtdate_from;
  @ViewChild("txtdate_to") txtdate_to;
  course_no: string;
  course: any = {};
  courses: any = [];
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
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
                text: '<i class="far fa-file-excel"></i> Csv</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> Pdf</button>',
              }, */
            ]
          }
        ],
      },
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      "order": [[ 0, "desc" ]]
    };

    this.get_courses()
  }
  ngAfterViewInit() {
    // this.txtdate_from.nativeElement.value = formatDate(new Date(this.date.getFullYear(), this.date.getMonth(), 1)).toString();
    // this.txtdate_to.nativeElement.value = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0)).toString();
    // this.fnGet("NULL", this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
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

 /*  async onKeyCourse(event: any) {
    if (event.target.value.length >= 3 && event.target.value.length < 15) {
      this.fnGet(event.target.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
    }else if(event.target.value.length == 0){
      this.fnGet("NULL", this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
    }
  } */
  onDateSelectTo(event) {
    console.log('onDateSelectTo: ', event);
    // this.fnGet(this.txtcourse_no.nativeElement.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
  }
  onDateSelectFrom(event) {
    console.log('onDateSelectFrom: ', event);
    // this.fnGet(this.txtcourse_no.nativeElement.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
  }

  // Open popup Course
  inputitem = 'course-target';
  openCourse(content) {
    //   size: 'lg' //sm, mb, lg, xl
    this.v_course_no = "";
    const modalRef = this.modalService.open(content, { size: 'lg' });
    modalRef.result.then(
      (result) => {
        console.log(result);
        if (result != "OK") {
          this.txtcourse_no.nativeElement.value = "";
          // this.fnGet("NULL", this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
          this.v_course_no = "";
        }else{
          // this.fnGet(this.txtcourse_no.nativeElement.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
        }
      },
      (reason) => {
        console.log(reason);
        this.txtcourse_no.nativeElement.value = "";
        // this.fnGet("NULL", this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
        this.v_course_no = "";
      }
    );
  }

  v_course_no: string = "";
  addItemCourse(newItem: string) {
    this.v_course_no = newItem;
    this.txtcourse_no.nativeElement.value = newItem;
  }

  // async fnGet(course_no: string, date_start: string, date_end: string) {
  async get_course(){
    // await this.service.gethttp('OtherData/GetCountTrainee?course_no=' + course_no + '&date_start=' + date_start + '&date_end=' + date_end)
    await this.service.gethttp(`OtherData/GetCountTrainee?course_no=${this.course_no}`)  
    .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;

        // Calling the DT trigger to manually render the table
        if (this.isDtInitialized) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}
