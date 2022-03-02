import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';

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
  }
  ngAfterViewInit() {
    this.txtdate_from.nativeElement.value = formatDate(new Date(this.date.getFullYear(), this.date.getMonth(), 1)).toString();
    this.txtdate_to.nativeElement.value = formatDate(new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0)).toString();
    this.fnGet("NULL", this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
  }

  async onKeyCourse(event: any) {
    if (event.target.value.length >= 3 && event.target.value.length < 15) {
      this.fnGet(event.target.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
    }else if(event.target.value.length == 0){
      this.fnGet("NULL", this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
    }
  }
  onDateSelectTo(event) {
    console.log('onDateSelectTo: ', event);
    this.fnGet(this.txtcourse_no.nativeElement.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
  }
  onDateSelectFrom(event) {
    console.log('onDateSelectFrom: ', event);
    this.fnGet(this.txtcourse_no.nativeElement.value, this.txtdate_from.nativeElement.value , this.txtdate_to.nativeElement.value);
  }

  async fnGet(course_no: string, date_start: string, date_end: string) {
    await this.service.gethttp('OtherData/GetCountTrainee?course_no=' + course_no + '&date_start=' + date_start + '&date_end=' + date_end)
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

export interface PeriodicElement {
  course_no: string;
  course_name_th: string;
  course_name_en: string;
  start_date: string;
  end_date: string;
  place: string;
  count: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    course_no: 'PTM-001-001',
    course_name_th: 'ข้อบังคับการทำงาน',
    course_name_en: 'COMPANY RULES',
    start_date: '2013-10-30',
    end_date: '2013-10-30',
    place: 'TRAINING ROOM 2',
    count: 48,
  }, {
    course_no: 'PTM-001-002',
    course_name_th: 'ข้อบังคับการทำงาน',
    course_name_en: 'COMPANY RULES',
    start_date: '2014-05-03',
    end_date: '2014-05-03',
    place: 'TRAINING ROOM 1',
    count: 16,
  }, {
    course_no: 'PTM-002-001',
    course_name_th: 'การพัฒนาทักษะหัวหน้างาน',
    course_name_en: 'MANAGEMENT & LEADERSHIP SKILL DEVELOPMENT',
    start_date: '2013-11-08',
    end_date: '2013-11-09',
    place: 'CHOLAPRUEK RES ...',
    count: 22,
  }, {
    course_no: 'PTM-003-001',
    course_name_th: 'การอบรบพนักงานหลังการทดลองงาน',
    course_name_en: 'TRAINING OF EMP. PASS PROBATION',
    start_date: '2015-01-28',
    end_date: '2015-01-28',
    place: 'TRAINING ROOM 2',
    count: 16,
  },
];
