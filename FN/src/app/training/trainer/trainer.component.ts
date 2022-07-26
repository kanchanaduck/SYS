import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AppServiceService } from '../../app-service.service'
import { Subject } from 'rxjs';

// DBCC CHECKIDENT ('HRGIS.dbo.tr_trainer', RESEED, 0)

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit, OnDestroy {

  trainers: any= [];
  trainer: any = {};
  errors: any;
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

  filter_trainer_owner: string = "";
  filter_trainer_type: string = "";

  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;
  is_center: boolean = false;
  is_committee: boolean = false;
  trainer_owner: any = [];

  constructor(
    private service: AppServiceService, 
    private httpClient: HttpClient
  ) { }


  ngOnInit(): void {

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set div_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code

    this.get_trainer_owner();

    $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
      const trainer_owner = data[6]; 
      const trainer_type = data[8]; 
      if ((this.filter_trainer_type=="" && this.filter_trainer_owner=="") ||
        (this.filter_trainer_type=="" && trainer_owner == this.filter_trainer_owner) ||
        (this.filter_trainer_type == trainer_type && this.filter_trainer_owner=="") ||
        (this.filter_trainer_type == trainer_type && trainer_owner == this.filter_trainer_owner)) {
        return true;
      }
      return false;
    });


  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }
  
  async get_trainer_owner() {
    await this.httpClient.get(`${environment.API_URL}Trainers/Owner`, this.headers)
    .subscribe((response: any) => {
      this.trainer_owner = response;
      this.check_is_committee()
      this.trainer.trainer_type = 'Internal';
      this.trainer.company = 'CPT'
    },
    (error: any) => {
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
        self.trainer.org_code = self._org_code
        self.filter_trainer_owner = self._org_abb+" ("+self._org_code+")";
        self.get_trainers()
        self.datatable()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
        self.filter_trainer_owner = ""
        self.get_trainers()
        self.datatable()
      });


      
  }
  async get_trainers(){
    let self = this
    await this.httpClient.get(`${environment.API_URL}Trainers`, this.headers)
    .subscribe((response: any) => {
      self.trainers = response;
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.clear().draw();
          this.isDtInitialized = true
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      } 
      else {
        this.isDtInitialized = true
        this.dtTrigger.next();
      }
    },
    (error: any) => {
      console.log(error);
    });
  }

  async reset_form_trainer() { 
    this.trainer = {};
    this.trainer.trainer_type='Internal';
    this.trainer.company = 'CPT'
    this.trainer.org_code = this._org_code;
    this.errors = {};
  }

  async fillEmpNo(event: any) { 
    if(this.trainer.emp_no.length==6){
      this.get_employee()
    }
  }
   
  async get_employee() {
    let self =this
    await axios.get(`${environment.API_URL}Employees/${this.trainer.emp_no}`,this.headers)
    .then(function (response) {
      console.log(response)
      self.trainer = response
      self.trainer.trainer_type = "Internal"
      self.trainer.company = "CPT"
      self.trainer.org_code = self._org_code
    }) 
    .catch(function (error) {
      console.log(error)
      self.reset_form_trainer()
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }) 
  }

  async get_trainer(trainer_no: number) {
    try {
      const response = await axios.get(`${environment.API_URL}Trainers/${trainer_no}`, this.headers);
      this.trainer = response
      this.trainer.org_code  = this.trainer.trainer_owner_code
      return response;
    } 
    catch (error) {
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: "Data not found"
      })
    }
  }

  async change_trainer_type(event: any) {
    this.reset_form_trainer()
    this.trainer.trainer_type = event;
    this.trainer.org_code = this._org_code;
    this.errors = {};
    if(this.trainer.trainer_type=='External'){
      this.trainer.company = ''
    }
  }

  async save_trainer() {
    let self = this
    await axios.post(`${environment.API_URL}Trainers`,this.trainer, this.headers)
    .then(function (response) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: "Success",
        showConfirmButton: false,
        timer: 2000
      })
    self.reset_form_trainer()
    self.errors = {};
    self.get_trainers()
    })
    .catch(function (error) {
        self.errors = error.response.data.errors
        Swal.fire({
          icon: 'error',
          title: error.response.status,
          text: typeof error.response.data === 'object'? error.response.data.title:error.response.data
        })
    });
  }

  async delete_trainer(trainer_no: number) {
    let self = this
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to delete this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.value) {
        await axios.delete(`${environment.API_URL}Trainers/${trainer_no}`, this.headers)
        .then(function (response) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: "Success",
            showConfirmButton: false,
            timer: 2000
          })
        })
        .catch(function (error) {
          Swal.fire({
            icon: 'error',
            title: error.response.status,
            text: error.response.data
          })
        });
        self.get_trainers()
      }
    })
  }

  async filter_trainer() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  async datatable(){
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
      "processing": true,
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
                title: 'HRGIS/Training: Trainer',
                filename: 'HRGIS_Training_Trainer',
                exportOptions: {
                  columns: [ 0,1,2,3,4,5,6,7,8 ]
                },
              },
              {
                text: '<i class="far fa-file-alt"></i> Whole history</button>',
                action: function ( e, dt, node, config ) {
                  window.open("http://cptsvs531/HRGIS_REPORT/Training/TrainerHistory","_blank")
                }
              }
            ]
          },
        ],
      },
      order: [[6, 'asc'], [8, 'desc'],[0, 'asc']],
      rowGroup: {
        dataSrc: [6, 8]
      }, 
      columnDefs: [ 
        {
          targets: [ 6,8 ],
          visible: false
        },
        {
          targets: [ 10 ],
          visible: this.is_committee? true:false
        },
        {
          targets: [ 9, 10],
          orderable: false 
        } 
      ],
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };
  }

}

