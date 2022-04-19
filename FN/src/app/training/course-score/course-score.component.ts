import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import axios from 'axios';

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
  @ViewChild("txtgroup") txtgroup;
  @ViewChild("txtqty") txtqty;
  @ViewChild("txtdate_from") txtdate_from;
  @ViewChild("txtdate_to") txtdate_to;
  @ViewChild("txtplace") txtplace;
  @ViewChild("txttotal") txttotal;
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
  form: FormGroup;
  submitted = false;
  is_committee: boolean;
  _org_code: any;
  courses: any;
  course:any= {};
  response: any;
  course_no: any;

  constructor(private modalService: NgbModal, config: NgbModalConfig,private formBuilder: FormBuilder, private service: AppServiceService, private exportexcel: ExportService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        frm_emp_no: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
        frm_emp_name: ['', [Validators.required]],
        frm_pre_test_score: [''],
        frm_post_test_score: [''],
      },
    );

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no

    this.fnGetband();
    this.check_is_committee()
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
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
    await axios.get(`${environment.API_URL}Courses/Owner/${this._org_code}`, this.headers)
    .then(function(response){
      self.courses = response
    })
    .catch(function(error){
  
    });
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
          // self.data_grid = self.response.courses.courses_registrations
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

          // if(self.response.courses_bands.length>0){
          //   self.arr_band = self.response.courses_bands; // console.log(self.arr_band);

          //   var nameArr = self.response.courses_bands; // console.log(nameArr);
          //   for (const iterator of nameArr) {
          //     self.array_chk.find(v => v.band === iterator.band).isChecked = true;
          //   } // console.log(self.array_chk);
          //   self.checkboxesDataList = self.array_chk;
          // }

          self.fnGet()
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
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear().draw();
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
      pageLength: 10,
    };
  }
  

  async fnSave() {
    this.submitted = true;

    console.log(this.form)

    if (this.form.invalid) {
      alert('SAVE1')
      return;
    }
    console.log(JSON.stringify(this.form.value, null, 2));

    // if (this.dept_emp != this._org_abb && this.div_emp != this._org_abb) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: "",
    //     text: environment.text.invalid_department
    //     // ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากพนักงานไม่ได้อยู่ใน DEPARTMENT ของคุณ.
    //   })

    //   return;
    // }

    if (!this.arr_band.some(x => x.band == this.txtband.nativeElement.value)) {
      alert('SAVE2')
      Swal.fire({
        icon: 'error',
        title: "",
        text: environment.text.unequal_band
        // ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากพนักงานไม่อยู่ใน band ที่กำหนด.
      })

      return;
    }

    let frm = this.form.value;
    var array = [{
      emp_no: frm.frm_emp_no,
      pre_test_score: frm.frm_pre_test_score,
      pre_test_grade: this.txtpre_test_grade.nativeElement.value,
      post_test_score: frm.frm_post_test_score,
      post_test_grade: this.txtpost_test_grade.nativeElement.value
    }];
    const send_data = {
      course_no: this.course_no,
      array: array
    }
    console.log(send_data);

    if (array.length > 0) {
      await this.service.axios_post("RegisterScore", send_data, environment.text.success);
    }
    this.fnGet();
  }
  async fnUpdate() {
    this.submitted = true;

    if (this.form.invalid) {
      alert('UPDATE1')
      return;
    }
    // console.log(JSON.stringify(this.form.value, null, 2));
    // console.log(this.form.value);

    // if (this.dept_emp != this._org_abb && this.div_emp != this._org_abb) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: "",
    //     text: environment.text.invalid_department
    //     // ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากพนักงานไม่ได้อยู่ใน DEPARTMENT ของคุณ.
    //   })

    //   return;
    // }

    if (!this.arr_band.some(x => x.band == this.txtband.nativeElement.value)) {
      alert('UPDATE2')
      Swal.fire({
        icon: 'error',
        title: "",
        text: environment.text.unequal_band
        // ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากพนักงานไม่อยู่ใน band ที่กำหนด.
      })

      return;
    }

    let frm = this.form.value;
    var array = [{
      emp_no: frm.frm_emp_no,
      pre_test_score: frm.frm_pre_test_score,
      pre_test_grade: this.txtpre_test_grade.nativeElement.value,
      post_test_score: frm.frm_post_test_score,
      post_test_grade: this.txtpost_test_grade.nativeElement.value
    }];
    const send_data = {
      course_no: frm.frm_course,
      array: array
    }
    console.log(send_data);

    if (array.length > 0) {
      await this.service.axios_put("RegisterScore/" + this.course_no, send_data, environment.text.success);
    }
    this.fnGet();
  }
  fnClear() {
    this.form.controls['frm_emp_no'].setValue("");
    this.txtfull_name.nativeElement.value = "";
    this.txtdept.nativeElement.value = "";
    this.txtposition.nativeElement.value = "";
    this.txtband.nativeElement.value = "";
    this.form.controls['frm_pre_test_score'].setValue("");
    this.txtpre_test_grade.nativeElement.value = "";
    this.form.controls['frm_post_test_score'].setValue("");
    this.txtpost_test_grade.nativeElement.value = "";
    this.visableSave = true;
    this.visableUpdate = false;
    this.isreadonly = false;
  }
  fnEdit(item) {
    this.form.controls['frm_emp_no'].setValue(item.employees.emp_no);
    this.form.controls['frm_emp_name'].setValue(item.employees.title_name_en + ' ' + item.employees.firstname_en + ' ' + item.employees.lastname_en);
    this.txtdept.nativeElement.value = item.employees.dept_code + ':' + item.employees.dept_abb;
    this.txtposition.nativeElement.value = item.employees.position_name_en;
    this.txtband.nativeElement.value = item.employees.band;

    this.form.controls['frm_pre_test_score'].setValue(item.pre_test_score);
    this.form.controls['frm_post_test_score'].setValue(item.post_test_score);
    this.txtpre_test_grade.nativeElement.value = item.pre_test_grade;
    this.txtpost_test_grade.nativeElement.value = item.post_test_grade;

    this.dept_emp = item.employees.dept_abb;
    this.div_emp = item.employees.div_abb_name;

    this.visableSave = false;
    this.visableUpdate = true;
    this.isreadonly = true;
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
        await this.service.axios_delete('RegisterScore/' + this.course_no + '/' + item.emp_no, environment.text.delete);
        this.fnGet();
      }
    })
  }

  res_course: any = [];
  arr_band: any;

  onKeyEmpno(event: any) {
    if (event.target.value.length >= 6 && event.target.value.length <= 7) {
      this.searchEmp(event.target.value);
    } else if (event.target.value.length == 0) {
      this.fnClear();
    }
  }
  res_emp: any = [];
  dept_emp: any = ''; div_emp: any = '';
  async searchEmp(empno: any) {
    this.res_emp = await this.service.axios_get('Employees/' + empno); // console.log('searchEmp: ', this.res_emp);
    if (this.res_emp != null || this.res_emp != undefined) {
      this.form.controls['frm_emp_name'].setValue(this.res_emp.title_name_en + " " + this.res_emp.firstname_en + " " + this.res_emp.lastname_en);
      this.dept_emp = this.res_emp.dept_abb;
      this.div_emp = this.res_emp.div_abb_name;
      this.txtdept.nativeElement.value = this.res_emp.dept_code + ":" + this.res_emp.dept_abb;
      this.txtposition.nativeElement.value = this.res_emp.position_name_en;
      this.txtband.nativeElement.value = this.res_emp.band;
    } else {
      this.form.controls['frm_emp_name'].setValue("");
      this.txtdept.nativeElement.value = "";
      this.txtposition.nativeElement.value = "";
      this.txtband.nativeElement.value = "";
    }
  }

  onKeyPreTestScore(event) {
    // console.log(event.target.value);
    this.txtpre_test_grade.nativeElement.value = fnGrade(event.target.value);
  }
  onKeyPostTestScore(event) {
    this.txtpost_test_grade.nativeElement.value = fnGrade(event.target.value);
  }

  /** File Upload, Download */
  dowloadFormat() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'assets/format/format input score.xlsx');
    link.setAttribute('download', `format input score.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
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
    if (this.form.controls['frm_course'].value == "") {
      return;
    }

    let formData = new FormData();
    if (this.customFile.nativeElement.value !== undefined && this.customFile.nativeElement.value !== "" && this.customFile.nativeElement.value !== null) {
      formData.append('file_form', this.file)
      formData.append('file_name', this.fileName)
      formData.append('dept_abb', this._org_abb)
      
      this.result = await this.service.axios_formdata_post('/RegisterScore/UploadCourseScore/' + this.course_no, formData, environment.text.success);
      // // console.log('result: ', this.result.data);
      if (this.result.data.length > 0) {
        let element = this.result.data;
        this.exportexcel.exportJSONToExcel(element, 'ResultRegisterScore');
      }

      this.customFile.nativeElement.value = ""; // console.log(this.file); // console.log(this.fileName);
      this.nameFile = 'Choose file';
      await this.fnGet();
    }
  }
  /** End File Upload, Download */

  async fnGet() {
    await this.service.gethttp('RegisterScore/' + this.course_no)
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

  array_chk: any;
  async fnGetband() {
    this.array_chk = await this.service.axios_get('Bands'); //console.log(this.array_chk);
    this.array_chk.forEach(object => {
      object.isChecked = false;
    }); //console.log(this.array_chk);
    this.checkboxesDataList = this.array_chk; //console.log(this.checkboxesDataList);
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