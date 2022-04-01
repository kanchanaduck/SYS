import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employee-course-history',
  templateUrl: './employee-course-history.component.html',
  styleUrls: ['./employee-course-history.component.scss']
})
export class EmployeeCourseHistoryComponent implements OnInit {
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  emp_no: string;
  // end datatable

  constructor(private service: AppServiceService) { }
  /* private download_excel = function(){
    alert("Entry")
    location.href = `${environment.API_URL}OtherData/GetEmployeeTraining/Excel?emp_no=${this.emp_no}`
  } */

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
                text: '<i class="far fa-file-excel"></i> History</button>',
                action: function ( e, dt, node, config ) {
                  alert("DOWNLOAD")
                  this.download_excel()
                }
              },           
            ]
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      order: [[0, 'desc']],
    };
    this.fnGet("NULL");

    function download_excel(){
      alert(this.emp_no)
    }
  }

  download_excel(): void{
    alert(this.emp_no)
  }

  async onKeyEmp(event: any) {
    if (event.target.value.length >= 6 && event.target.value.length < 8) {
      this.fnGet(event.target.value);
    }
    else if(event.target.value.length == 0){
      this.fnGet("NULL");
    }
  }

  async fnGet(emp_no:string) {


    await this.service.gethttp('OtherData/GetEmployeeTraining?emp_no=' + emp_no)
      .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;
        // this.header = response[0]

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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }


}
