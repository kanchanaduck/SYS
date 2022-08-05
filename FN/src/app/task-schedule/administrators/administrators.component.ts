import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';
import { Settings } from 'src/app/settings';

@Component({
  selector: 'app-administrators',
  templateUrl: './administrators.component.html',
  styleUrls: ['./administrators.component.scss']
})
export class AdministratorsComponent implements OnInit {
  dtOptions: any = {};
  employees: any = {};
  c: any = {};
  center: any = {};
  _getjwt: any;
  _emp_no: string;
  _dept_abb: string;
  history_dump: any = [];

  constructor(private service: AppServiceService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this._dept_abb = this._getjwt.user.dept_abb; // set dept_abb
    this.get_hrms()
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
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="far fa-file-excel"></i> Excel</button>',
                },
                {
                    text: '<i class="far fa-file-excel"></i> History</button>',
                    action: function ( e, dt, node, config ) {
                       alert('เอาไว้ดาวน์โหลดประวัติการสอนค่าาา')
                    }
                },
            ]
          },
          {
            text: '<i class="fas fa-plus"></i> New</button>',
            action: () => {
              console.log()
            }
          }
        ],
      },
      order: [[3, 'asc'], [4, 'asc'], [5, 'desc'], [6, 'desc'], [1, 'asc']],
      columnDefs: [ {
        targets: [ 0, 9 ],
        orderable: false
      } ],

      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };


  }

  dump_hrms(){
    axios.get(`${environment.API_URL}OracleHRMS/Employee/Dump`, Settings.headers)
    .then((response) => {
      alert("success")
      location.reload()
    })
    .catch((error) => {
      console.error(error);
    })
  }

  get_hrms(){
    axios.get(`${environment.API_URL}OracleHRMS/HistoryDump`, Settings.headers)
    .then((response) => {
      this.history_dump = response
    })
    .catch((error) => {
      console.error(error);
    })
  }

}
