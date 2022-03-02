import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';

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

  constructor(private service: AppServiceService) { }

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
                text: '<i class="far fa-file-excel"></i> CSV</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> PDF</button>',
              },              
            ]
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      // order: [[1, 'desc']],
      rowGroup: {
        dataSrc: [ 1 ]
      },
      columnDefs: [ {
        targets: [ 1 ],
        visible: false
      }]
    };

    this.fnGet("NULL");
  }

  async onKeyCourse(event: any) {
    if (event.target.value.length >= 3 && event.target.value.length < 15) {
      this.fnGet(event.target.value);
    }else if(event.target.value.length == 0){
      this.fnGet("NULL");
    }
  }

  async fnGet(course_no:string) {
    await this.service.gethttp('OtherData/GetCountAttendee?course_no=' + course_no)
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
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}

export interface PeriodicElement {
  course_no: string;
  course_name_en: string;
  emp_no: string;
  status_eng: string;
  firstname_en: string;
  lastname_en: string;
  posn_name: string;
  dept_abb: string;
  div_abb: string;
  pre_test_score: number;
  pre_test_grade: string;
  post_test_score: number;
  post_test_grade: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    course_no: 'CPT-001-001',
    course_name_en: 'QC Basics',
    emp_no: '014748',
    status_eng: 'MISS',
    firstname_en: 'NUTTAYA',
    lastname_en: 'KALLA',
    posn_name: 'PROGRAMMER',
    dept_abb: 'ICD',
    div_abb: 'CPD',
    pre_test_score: 80,
    pre_test_grade: 'A',
    post_test_score: 90,
    post_test_grade: 'A',
  }, {
    course_no: 'CPT-001-001',
    course_name_en: 'QC Basics',
    emp_no: '014205',
    status_eng: 'MR.',
    firstname_en: 'KHETCHANA',
    lastname_en: 'KETSAUAONG',
    posn_name: 'TECHNICIAN',
    dept_abb: 'ICD',
    div_abb: 'CPD',
    pre_test_score: 95,
    pre_test_grade: 'A',
    post_test_score: 100,
    post_test_grade: 'A',
  },{
    course_no: 'CPT-001-002',
    course_name_en: 'QC Basics',
    emp_no: '014748',
    status_eng: 'MISS',
    firstname_en: 'NUTTAYA',
    lastname_en: 'KALLA',
    posn_name: 'PROGRAMMER',
    dept_abb: 'ICD',
    div_abb: 'CPD',
    pre_test_score: 80,
    pre_test_grade: 'A',
    post_test_score: 90,
    post_test_grade: 'A',
  }, {
    course_no: 'CPT-001-002',
    course_name_en: 'QC Basics',
    emp_no: '014205',
    status_eng: 'MR.',
    firstname_en: 'KHETCHANA',
    lastname_en: 'KETSAUAONG',
    posn_name: 'TECHNICIAN',
    dept_abb: 'ICD',
    div_abb: 'CPD',
    pre_test_score: 95,
    pre_test_grade: 'A',
    post_test_score: 100,
    post_test_grade: 'A',
  },
];