import { Component, OnInit, Self, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import axios from 'axios';
import { Injectable, ElementRef } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_EXTENSION = '.xlsx';
const CSV_EXTENSION = '.csv';
const CSV_TYPE = 'text/plain;charset=utf-8';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-course-score',
  templateUrl: './course-score.component.html',
  styleUrls: ['./course-score.component.scss']
})
export class CourseScoreComponent implements OnInit {
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable
  checkboxesDataList: any[];
  @ViewChild("txtfull_name") txtfull_name;
  @ViewChild("txtdept") txtdept;
  @ViewChild("txtposition") txtposition;
  @ViewChild("txtband") txtband;
  @ViewChild("txtpre_test_grade") txtpre_test_grade;
  @ViewChild("txtpost_test_grade") txtpost_test_grade;
  visableSave = true;
  visableUpdate = false;
  visableClear = false;
  visableButton = false;
  isreadonly = false;
  isClose: boolean = true;
  isIf: boolean = false;
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  submitted = false;
  is_committee: boolean;
  _org_code: any;
  courses: any;
  course:any= {};
  response: any;
  course_no: any;
  emp_no: any;
  pre_test_score: number;
  pre_test_grade: string;
  post_test_score: number;
  post_test_grade: string;
  pre_test_scores:any = [];
  pre_test_grades:any = [];
  post_test_scores:any = [];
  post_test_grades:any = [];
  emp_nos:any = [];
  emp_name: string;
  emp_status: any;
  txt_not_pass: any;
  not_pass: boolean;
  errors:any= {};

  constructor(
    private modalService: NgbModal, 
    config: NgbModalConfig,
    private formBuilder: FormBuilder, 
    private service: AppServiceService, 
    private exportexcel: ExportService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no

    this.check_is_committee()
  }


  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.get_courses_owner()
        self.datatable()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
        // self.get_courses()
        // self.datatable()
      }); 
  }

  async get_courses_owner(){
    let self = this
    await axios.get(`${environment.API_URL}Courses/Owner/${this._org_code}/NotOver10WorkingDays`, this.headers)
    .then(function(response){
      self.courses = response
      self.rerender()
    })
    .catch(function(error){
  
    });
  }

  async get_course() {
    let self = this
    
    this.errors = {}

    if(this.course_no==null)
    {
      this.course = {};
      this.data_grid = [];
      this.get_registrant();
      this.errors = {};
    }
    else
    {
      self.data_grid = [];
      axios.get(`${environment.API_URL}Courses/Trainers?course_no=${self.course_no}`,self.headers)
        .then(function(response: any){
          self.course = response.courses
          self.arr_band = response.courses.courses_bands
          let trainers = response.trainers
          if(self.course.trainer_text){
            self.course.trainer_text = self.course.trainer_text
          }
          else{
            if(trainers.length>0){
              self.course.trainer_text = trainers.map(c => c.display_name).join(', ');
            }
            else{
              self.course.trainer_text = "-"
            }
          }

          let bands = self.arr_band
          if(bands.length>0){
            self.course.band_text = bands.map(c => c.band).join(', ');
          }
          else{
            self.course.band_text = "-"
          }

          self.get_registrant()
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
  
  custom_search_course_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
  }
  
  async clear_data() {
    this.course = {};
    this.data_grid = [];
    this.rerender();
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
            className: "btn btn-indigo btn-sm"
          },
        },
        "buttons": [
          {
            extend: 'pageLength',
            className: 'btn-outline-indigo',
          },
          {
            extend: 'copy',
            text: '<i class="fas fa-copy"></i> Copy</button>',
            className: 'btn-outline-indigo',
          },
          {
            extend: 'print',
            text: '<i class="fas fa-print"></i> Print</button>',
            className: 'btn-outline-indigo',
          },
          {
            text: '<i class="fas fa-save"></i> Save</button>',
            action: () => {
              this.update_score();
            }
          },
        ],
      },
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
      columnDefs: [
        {
          targets: [9],
          orderable: false
        }
      ],
    };
  }
  

  async register() {
    let self = this
    var send_data = {
      course_no: this.course_no,
      emp_no: this.emp_no,
      pre_test_score: this.pre_test_score,
      pre_test_grade: this.pre_test_grade,
      post_test_score: this.post_test_score,
      post_test_grade: this.post_test_grade,
    };
    if( this.data_grid.some(x => x.emp_no == this.emp_no)){
      await this.service.axios_put(`Register/ByCommitteeCourse/${this.course_no}/${this.emp_no}`, send_data, environment.text.success);
      this.fnClear()
      self.get_registrant()
    }
    else{
      axios.post(`${environment.API_URL}Register/ByCommitteeCourse`, send_data, this.headers)
      .then(function(){
        self.service.sweetalert_create()
        self.get_registrant()
      })
      .catch(function(error){
        self.errors = error.response.data.errors
        self.service.sweetalert_error(error)
      })
    }
  }

  async update_score(){
    let self = this
    let send_data = [];

    if(!this.course_no){
      console.log(this.course_no)
      this.errors =  {
        course_no: ["Please select course no."]
      };
      console.log(this.errors.course_no)
      return;
    }

    console.log(this.data_grid)
    console.log(this.emp_nos)

    for(let i=0; i<this.emp_nos.length; i++){
      send_data.push({
        course_no: this.course_no,
        emp_no: this.emp_nos[i],
        pre_test_score: this.pre_test_scores[i],
        pre_test_grade: this.pre_test_grades[i],
        post_test_score: this.post_test_scores[i],
        post_test_grade: this.post_test_grades[i],
      })
    }
    // console.log(send_data)
    if( send_data.length > 0){
      axios.put(`${environment.API_URL}Register/UpdateScore/${this.course_no}`, send_data, this.headers)
      .then(function(){
        self.service.sweetalert_edit()
        self.get_registrant()
        self.errors = {}
      })
      .catch(function(error){
        self.errors = error.response.data.errors
        // console.log(self.errors)
        // console.log(self.errors['[0].pre_test_score'])
        self.service.sweetalert_error(error)
      })
    }
  }

  fnClear() {
    this.errors = {}
    this.emp_no = "";
    this.emp_name = "";
    this.txtdept.nativeElement.value = "";
    this.txtposition.nativeElement.value = "";
    this.txtband.nativeElement.value = "";
    this.txt_not_pass = "";
    this.pre_test_grade = "";
    this.pre_test_score = null;
    this.post_test_grade = "";
    this.post_test_score = null;
  }

  fnEdit(item) {
    this.errors = {};
    this.emp_no = item.employees.emp_no;
    this.emp_name = `${item.employees.title_name_en}${item.employees.firstname_en} ${item.employees.lastname_en}`;
    this.txtdept.nativeElement.value = `${item.employees.div_abb}/${item.employees.dept_abb}`;
    this.txtposition.nativeElement.value = item.employees.position_name_en;
    this.txtband.nativeElement.value = item.employees.band;
    this.pre_test_grade = item.pre_test_grade;
    this.pre_test_score = item.pre_test_score
    this.post_test_grade = item.post_test_grade
    this.post_test_score = item.post_test_score
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
        await this.service.axios_delete('Register/' + this.course_no + '/' + item.emp_no, environment.text.delete);
        this.get_registrant();
      }
    })
  }

  res_course: any = [];
  arr_band: any;

  onKeyEmpno() {
    if (this.emp_no.length >= 6 && this.emp_no.length <= 7) {
      this.searchEmp(this.emp_no);
      this.searchPrevCourse(this.emp_no);
    } 
    else if (this.emp_no.length == 0) {
      this.fnClear();
    }
  }

  res_emp: any = [];
  dept_emp: any = ''; div_emp: any = '';
  async searchEmp(empno: any) {
    this.res_emp = await this.service.axios_get('Employees/' + empno); // console.log('searchEmp: ', this.res_emp);
    if (this.res_emp != null || this.res_emp != undefined) {
      this.emp_name = this.res_emp.title_name_en + " " + this.res_emp.firstname_en + " " + this.res_emp.lastname_en;
      this.dept_emp = this.res_emp.dept_abb;
      this.div_emp = this.res_emp.div_abb;
      this.emp_status = this.res_emp.employed_status
      this.txtdept.nativeElement.value = `${this.res_emp.div_abb}/${this.res_emp.dept_abb}`;
      this.txtposition.nativeElement.value = this.res_emp.position_name_en;
      this.txtband.nativeElement.value = this.res_emp.band;
    } else {
      this.emp_name= "";
      this.emp_status = "";
      this.txtdept.nativeElement.value = "";
      this.txtposition.nativeElement.value = "";
      this.txtband.nativeElement.value = "";
    }
  }
  res_prev: any;
  async searchPrevCourse(emp_no: any) {
    this.res_prev = await this.service.axios_get('Register/GetPrevCourse/' + this.course_no + '/' + emp_no); // console.log('searchPrevCourse: ', this.res_prev);
    if (this.res_prev != "" || this.res_prev != null) {
      this.txt_not_pass = this.res_prev;
      this.not_pass = true;
    }
  }
  onKeyPreTestScore(event, i) {
    this.pre_test_grades[i] = fnGrade(event);
  }
  onKeyPostTestScore(event, i) {
    this.post_test_grades[i] = fnGrade(event);
  }

  onKeyPreTestScoreRegister(event) {
    this.pre_test_grade = fnGrade(event.target.value);
  }
  onKeyPostTestScoreRegister(event) {
    this.post_test_grade = fnGrade(event.target.value);
  }

  /** File Upload, Download */
 dowloadFormat() {
    let link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'assets/format/format input score.xlsx');

    const keys_to_keep = ['emp_no','pre_test_score','post_test_score'];
    let element  =  this.data_grid.map(o => keys_to_keep.reduce((acc, curr) => {
      acc[curr] = o[curr];
      return acc;
    }, {}));
    console.log("1")
    let fileName = `format input score_${this.course_no}.xlsx`
   let finalHeaders = ['emp_no','pre_test_score','post_test_score','เริ่มอ่านตั้งแต่แถวที่ 2 ลงทะเบียนใหม่ให้เพิ่มแถวใหม่ได้เลย ใส่รหัสพนักงานที่คอลัมน์ A ใส่ข้อมูลคะแนนที่คอลัมน์ B และ C '];
   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(element, {header: finalHeaders});
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();    
   XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');
   XLSX.writeFile(workbook, `${fileName}${EXCEL_EXTENSION}`);
    
  }    

  nameFile: string = 'Choose file';
  file: any;
  fileName: any;
  @ViewChild('customFile') customFile: any;
  chooseFile(e: any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.file = e.target.files[0];
      this.fileName = e.target.files[0].name;
      console.log(this.file);
      console.log(this.fileName);
      this.nameFile = this.fileName;
    }
  }
  result: any;
  async upload() {
    // alert("upload")

    let self = this
    
    if(!this.course_no){
      // alert("upload")
      console.log(this.course_no)
      this.errors =  {
        course_no: ["Please select course no."]
      };
      console.log(this.errors.course_no)
      return;
    }

    let formData = new FormData();
    // if (this.customFile.nativeElement.value !== undefined && this.customFile.nativeElement.value !== "" && this.customFile.nativeElement.value !== null) {
      formData.append('file_form', this.file)
      formData.append('file_name', this.fileName)
      formData.append('dept_abb', this._org_abb)

      await axios.post(`${environment.API_URL}Register/UploadCourseScore/${this.course_no}`
      , formData, this.headers)
      .then(function(response:any){
        if(response.length>0){
          Swal.fire({
            icon: 'warning',
            text: 'There is something error, please see the ResultInputScore.xlsx file.'
          })
          let element = response;
          self.exportexcel.exportJSONToExcel(element, 'ResultInputScore');
          self.customFile.nativeElement.value = ""; 
          self.nameFile = 'Choose file';
        }
        else{
          self.service.sweetalert_create();
        }
        self.get_registrant();
        self.errors = {};
      })
      .catch(function(error){
        self.errors = error.response.data.errors
        self.service.sweetalert_error(error);
        self.customFile.nativeElement.value = ""; 
        self.file = null;
        self.fileName = null;
        self.nameFile = 'Choose file';
      })
    // }

  }
  /** End File Upload, Download */

  async get_registrant() {
    await this.service.gethttp(`Register/Approved?course_no=${this.course_no}`)
      .subscribe((response: any) => {
        console.log(response);
        this.data_grid = response;
        let i=0;
        this.emp_nos = []
        this.pre_test_scores = []
        this.pre_test_grades = []
        this.post_test_scores = []
        this.post_test_grades = []
        this.data_grid.forEach(element => {
          this.emp_nos[i] = element.emp_no
          this.pre_test_scores[i] = element.pre_test_score
          this.pre_test_grades[i] = element.pre_test_grade
          this.post_test_scores[i] = element.post_test_score
          this.post_test_grades[i] = element.post_test_grade
          i++;
        });
        console.log(this.data_grid)
        console.log(this.emp_nos)
        this.rerender()
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
      });
  }

  rerender(){
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.clear().draw();
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } 
    else {
      this.isDtInitialized = true
      this.dtTrigger.next();
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
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