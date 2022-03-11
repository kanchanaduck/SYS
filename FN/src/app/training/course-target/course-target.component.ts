import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
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
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable

  @ViewChild("txtcourse_no") txtcourse_no;
  loading: boolean = false;

  constructor(private modalService: NgbModal, config: NgbModalConfig, processbar: NgbProgressbarConfig, private service: AppServiceService) { 
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

    this.fnGet("NULL");
  }

  async onKeyCourse(event: any) {
    if (event.target.value.length >= 7 && event.target.value.length < 8) {
      this.fnGet(event.target.value);
    }else if(event.target.value.length == 0){
      this.fnGet("NULL");
    }
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
          this.fnGet("NULL");
          this.v_course_no = "";
        }else{
          this.fnGet(this.txtcourse_no.nativeElement.value);
        }
      },
      (reason) => {
        console.log(reason);
        this.txtcourse_no.nativeElement.value = "";
        this.fnGet("NULL");
        this.v_course_no = "";
      }
    );
  }

  v_course_no: string = "";
  addItemCourse(newItem: string) {
    this.v_course_no = newItem;
    this.txtcourse_no.nativeElement.value = newItem;
  }

  async fnGet(course_no:string) {
    this.loading = true;
    await this.service.gethttp('OtherData/GetCourseTarget?course_no=' + course_no)
      .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;

        // Calling the DT trigger to manually render the table
        if (this.isDtInitialized) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        } else {
          this.isDtInitialized = true
          this.dtTrigger.next();
        }
        this.loading = false;
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
        this.loading = false;
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