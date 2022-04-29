import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import axios from 'axios';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-register-continuous',
  templateUrl: './register-continuous.component.html',
  styleUrls: ['./register-continuous.component.scss']
})
export class RegisterContinuousComponent implements OnInit {
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable
  @ViewChild("txtcourse_name_en") txtcourse_name_en;
  @ViewChild("txtgroup") txtgroup;
  @ViewChild("txtqty") txtqty;
  @ViewChild("txtdate_from") txtdate_from;
  @ViewChild("txtdate_to") txtdate_to;
  @ViewChild("txtplace") txtplace;
  @ViewChild("txtpre_test_grade") txtpre_test_grade;
  @ViewChild("txtpost_test_grade") txtpost_test_grade;
  @ViewChild("txttotal") txttotal;
  checkboxesDataList: any[];
  visableSave = false;
  visableUpdate = false;
  visableClear = false;
  isreadonly = false;
  isClose: boolean = true;
  isIf: boolean = false;
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  response: any;

  form: FormGroup;
  submitted = false;
  headers: any = {
    headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  is_committee: boolean;
  _org_code: any;
  course_no:string;
  course_no_view:string;
  course_no_register:string;
  course: any={};
  courses: any=[];
  courses_view: any=[];
  courses_register: any=[];
  errors:any={};

  constructor(private modalService: NgbModal, config: NgbModalConfig, private formBuilder: FormBuilder
    , private service: AppServiceService, private exportexcel: ExportService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        frm_emp_no_from: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
        frm_emp_no_to: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
        frm_pre_test_score: ['' ],
        frm_post_test_score: [''],
      },
    );

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this.check_is_committee()

    this.fnGetband();
    this.fnGetEmp();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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
          }, {
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
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      columnDefs: [
        {
          targets: [10],
          orderable: false,
        },
        {
          targets: [10],
          visible: this.is_committee
        }
      ],
    };
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
      axios.get(`${environment.API_URL}Courses/Trainers/${self.course_no}`,self.headers)
        .then(function(response){
          self.response = response
          self.course = self.response.courses
          self.arr_band = self.response.courses.courses_bands
          let trainers = self.response.trainers
          if(trainers.length>0){
            self.course.trainer_text = trainers.map(c => c.display_name).join(', ');
          }
          else{
            self.course.trainer_text = "-"
          }
          let bands = self.arr_band
          if(bands.length>0){
            self.course.band_text = bands.map(c => c.band).join(', ');
          }
          else{
            self.course.band_text = "-"
          }
          self.fnGet(self.course_no)
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

async get_courses(){
  let self = this
  // await axios.get(`${environment.API_URL}Courses`, this.headers)
  // .then(function(response){
  //   self.courses_view = response
  // })
  // .catch(function(error){

  // });
  await axios.get(`${environment.API_URL}Courses/Owner/${this._org_code}`, this.headers)
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

async check_is_committee() {
  let self = this
  await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
    .subscribe((response: any) => {
      console.log(response)
      self.is_committee = true;
      self._org_code = response.org_code
      self._org_abb = response.organization.org_abb
      self.get_courses()
      self.datatable()
    }, (error: any) => {
      console.log(error);
      self.is_committee = false;
      self.get_courses()
      self.datatable()
    }); 
}
  
  async save_trainee(){

      this.submitted=true;

    if (this.form.invalid) {
      return;
    }

    if(this.course_no===undefined){
      console.log(this.course_no)
      this.errors =  {
        course_no: ["Please select course no."]
      };
      console.log(this.errors.course_no)
      return;
    }

    let self = this
    let frm = this.form.value;
    let form_data = [];
    let emp_no = frm.frm_emp_no_from
    while(emp_no <= frm.frm_emp_no_to){
      let emp_padded = emp_no.toString().padStart(6, '0');
      let data = {
        course_no: this.course_no,
        emp_no: emp_padded,
        pre_test_score: frm.frm_pre_test_score,
        pre_test_grade: this.txtpre_test_grade.nativeElement.value,
        post_test_score: frm.frm_post_test_score,
        post_test_grade: this.txtpost_test_grade.nativeElement.value,
      };
      form_data.push(data)
      emp_no++;
    }
    console.log(form_data)
    if(form_data.length>0){
      axios.post(`${environment.API_URL}Registration/Continuous`,form_data,this.headers)
      .then(function (response) {
        self.fnGet(self.course_no);
        self.datatable()
        self.errors = {}
        self.fnClear()
      })
      .catch(function (error) {
        Swal.fire({
          icon: 'error',
          title: error.response.status,
          text: error.response.data
        })
      })
    }
  }

  fnDelete(item) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to delete this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.value) {
        await this.service.axios_delete('Registration/' + item.course_no + '/' + item.emp_no, environment.text.delete);
        this.fnGet(item.course_no);
      }
    })
  }

  res_course: any = [];
  arr_band: any;

  onKeyEmpNoFrom(event) {
    let check;
    check = fnEmpNoTotal(event.target.value, this.form.controls['frm_emp_no_to'].value);
    if (check >= 0) {
      this.txttotal.nativeElement.value = fnEmpNoTotal(event.target.value, this.form.controls['frm_emp_no_to'].value);
      this.form.get('frm_emp_no_to').setErrors(null);
    } else {
      this.txttotal.nativeElement.value = fnEmpNoTotal(event.target.value, this.form.controls['frm_emp_no_to'].value);
      this.form.get('frm_emp_no_from').setErrors({ someErrorFrom: true });
    }
  }
  onKeyEmpNoTo(event) {
    let check;
    check = fnEmpNoTotal(this.form.controls['frm_emp_no_from'].value, event.target.value);
    if (check >= 0) {
      this.txttotal.nativeElement.value = fnEmpNoTotal(this.form.controls['frm_emp_no_from'].value, event.target.value);
      this.form.get('frm_emp_no_from').setErrors(null);
    } else {
      this.txttotal.nativeElement.value = fnEmpNoTotal(this.form.controls['frm_emp_no_from'].value, event.target.value);
      this.form.get('frm_emp_no_to').setErrors({ someErrorTo: true });
    }
  }
  onKeyPreTestScore(event) {
    console.log(event.target.value);
    this.txtpre_test_grade.nativeElement.value = fnGrade(event.target.value);
  }
  onKeyPostTestScore(event) {
    this.txtpost_test_grade.nativeElement.value = fnGrade(event.target.value);
  }

  res_conflict: any;
  async fnGet(course_no) {
    await this.service.gethttp(`Registration/${course_no}`)
      .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;
        this.res_conflict = response;

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

  array_chk: any;
  async fnGetband() {
    this.array_chk = await this.service.axios_get('Bands'); //console.log(this.array_chk);
    this.array_chk.forEach(object => {
      object.isChecked = false;
    }); // console.log(this.array_chk);
    this.checkboxesDataList = this.array_chk; //console.log(this.checkboxesDataList);
  }

  res_emp: any;
  async fnGetEmp() {
    this.res_emp = await this.service.axios_get('Employees');
    // console.log('res_emp: ', this.res_emp);
    // console.log(this.res_emp[1].resign_date);
    // console.log(new Date(this.res_emp[1].resign_date));
    // console.log(new Date());    
    this.res_emp = this.res_emp.filter(x => x.resign_date == null || new Date(x.resign_date) >= new Date());
    console.log('res_emp: ', this.res_emp);
  }

  fnClear() {
    this.form.controls['frm_emp_no_from'].setValue("");
    this.form.controls['frm_emp_no_to'].setValue("");
    this.form.controls['frm_pre_test_score'].setValue("");
    this.txtpre_test_grade.nativeElement.value = "";
    this.form.controls['frm_post_test_score'].setValue("");
    this.txtpost_test_grade.nativeElement.value = "";
    this.txttotal.nativeElement.value = "";
    this.visableSave = true;
    this.visableUpdate = false;
    this.isreadonly = false;
  }

  // v_course_no: string = "";
  // addItemCourse(newItem: string) {
  //   this.v_course_no = newItem;
  //   this.form.controls['frm_course'].setValue(newItem);
  //   this.fnGetCourse(newItem);
  // }

  // async fnGetCourse(course_no: any) {
  //   let self = this
  //   await axios.get(`${environment.API_URL}Courses/${course_no}`, this.headers)
  //   .then(function(){
  //     self.fnGet(course_no);
  //   })
  //   .catch(function(){
      
  //   })
    /* this.res_course = await this.service.axios_get('Courses/OpenALL/' + course_no);
    console.log('fnGetCourse: ', this.res_course);
    if (this.res_course != undefined) {
      this.txtcourse_name_en.nativeElement.value = this.res_course.course_name_en;
      this.txtgroup.nativeElement.value = this.res_course.organization.org_abb;
      this.txtqty.nativeElement.value = this.res_course.capacity;
      this.txtdate_from.nativeElement.value = formatDate(this.res_course.date_start).toString() + ' ' + this.res_course.time_in.substring(0, 5);
      this.txtdate_to.nativeElement.value = formatDate(this.res_course.date_end).toString() + ' ' + this.res_course.time_out.substring(0, 5);
      this.txtplace.nativeElement.value = this.res_course.place;

      this.arr_band = this.res_course.courses_bands; // console.log(this.arr_band);

      var nameArr = this.res_course.courses_bands; // console.log(nameArr);
      for (const iterator of nameArr) {
        this.array_chk.find(v => v.band === iterator.band).isChecked = true;
      } // console.log(this.array_chk);
      this.checkboxesDataList = this.array_chk;

      this.fnGet(course_no);
    } else {
      this.txtcourse_name_en.nativeElement.value = "";
      this.txtgroup.nativeElement.value = "";
      this.txtqty.nativeElement.value = "";
      this.txtdate_from.nativeElement.value = "";
      this.txtdate_to.nativeElement.value = "";
      this.txtplace.nativeElement.value = "";
      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
      await this.fnGet("No");
    } */
  // }
  // End Open popup Course

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

function fnEmpNoTotal(start, end) {
  // console.log('start: ', parseInt(start), ' end: ', parseInt(end));
  let total = 0;
  total = parseInt(end) - parseInt(start) + 1;
  return isNaN(total) ? 0 : total;
}
function fnGrade(score) {
  let grade = "Fail";

  if (score == "") { grade = ""; }
  else if (score >= 80 && score <= 100) { grade = "A"; }
  else if (score >= 70 && score <= 79) { grade = "B"; }
  else if (score >= 60 && score <= 69) { grade = "C"; }
  else if (score >= 50 && score <= 59) { grade = "D"; }
  else if (score >= 1 && score <= 49) { grade = "E"; }
  else if (score == 0) { grade = "F"; }

  return grade;
}

export interface PeriodicElement {
  emp_no: string;
  title_name_en: string;
  firstname_en: string;
  lastname_en: string;
  band: string;
  dept_code: string;
  dept_abb: string;
  probation_date: string;
  resign_date: string;
  pre_test_score: number;
  pre_test_grade: string;
  post_test_score: number;
  post_test_grade: string;
  status: string;
}