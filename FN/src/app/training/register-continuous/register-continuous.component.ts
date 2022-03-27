import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

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

  form: FormGroup;
  submitted = false;

  constructor(private modalService: NgbModal, config: NgbModalConfig, private formBuilder: FormBuilder
    , private service: AppServiceService, private exportexcel: ExportService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        frm_course: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(20)]],
        frm_emp_no_from: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
        frm_emp_no_to: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
        // frm_pre_test_score: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
        // frm_post_test_score: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(3)]],
        frm_pre_test_score: ['', [Validators.minLength(1), Validators.maxLength(3)]],
        frm_post_test_score: ['', [Validators.minLength(1), Validators.maxLength(3)]],
      },
    );

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no

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

    this.fnGetStakeholder(this._emp_no);
    this.fnGetband();
    this.fnGetEmp();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /* async fnSave() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    console.log(JSON.stringify(this.form.value, null, 2));

    let frm = this.form.value;
    var n = parseInt(frm.frm_emp_no_from);
    var x = parseInt(frm.frm_emp_no_to);
    var array = [];
    var array_non = [];

    while (n <= x) {
      const result = {}
      const result_non = {}
      const padded = n.toString().padStart(6, '0');
      let filters = this.res_emp.filter(x => x.emp_no == padded); // console.log(filters);

      if (filters.length > 0) { // ตรวจสอบข้อมูลระหว่าง emp_no ที่กรอก กับข้อมูลใน employee
        let filter_conf = this.res_conflict.filter(x => x.emp_no == padded); console.log('filter_conf: ', filter_conf);
        if (filter_conf.length > 0) { // ตรวจสอบข้อมูลระหว่าง emp_no ที่กรอก กับข้อมูลในที่ถูก register ไปแล้ว
          result_non["emp_no"] = padded;
          result_non["remark"] = environment.text.duplication;
          array_non.push(result_non);
        } else {
          result["emp_no"] = padded;
          array.push(result);
        }
      } else if (filters.length == 0) {
        result_non["emp_no"] = padded;
        result_non["remark"] = "The employee do not match with database.";
        array_non.push(result_non);
      }
      result["pre_test_score"] = frm.frm_pre_test_score == "" ? 0 : frm.frm_pre_test_score;
      result["pre_test_grade"] = this.txtpre_test_grade.nativeElement.value;
      result["post_test_score"] = frm.frm_post_test_score == "" ? 0 : frm.frm_post_test_score;
      result["post_test_grade"] = this.txtpost_test_grade.nativeElement.value;

      n++;
    }
    console.log(array);
    console.log(array_non);

    const send_data = {
      course_no: frm.frm_course,
      array: array
    }
    console.log(send_data);

    if (array.length > 0) {
      await this.service.axios_post("RegisterScore/Continuous", send_data, environment.text.success);
    }

    if (array_non.length > 0) {
      let element = array_non;
      this.exportexcel.exportJSONToExcel(element, 'ResultRegisterContinuous');
    }

    this.fnGet(frm.frm_course);
  } */
  
  /* async save_trainee(){
    let frm = this.form.value;
    let course_no: frm.frm_course;
  } */

  async fnUpdate() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    // console.log(JSON.stringify(this.form.value, null, 2));
    // console.log(this.form.value);

    let frm = this.form.value;
    var array = [{
      emp_no: frm.frm_emp_no_from,
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
      await this.service.axios_put("RegisterScore/" + frm.frm_course, send_data, environment.text.success);
    }
    this.fnGet(frm.frm_course);
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
  fnEdit(item) {
    // console.log(item);
    this.form.controls['frm_emp_no_from'].setValue(item.employees.emp_no);
    this.form.controls['frm_emp_no_to'].setValue(item.employees.emp_no);
    this.form.controls['frm_pre_test_score'].setValue(item.pre_test_score);
    this.form.controls['frm_post_test_score'].setValue(item.post_test_score);
    this.txtpre_test_grade.nativeElement.value = item.pre_test_grade;
    this.txtpost_test_grade.nativeElement.value = item.post_test_grade;
    this.txttotal.nativeElement.value = fnEmpNoTotal(item.employees.emp_no, item.employees.emp_no);
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
        await this.service.axios_delete('RegisterScore/' + item.course_no + '/' + item.emp_no, environment.text.delete);
        this.fnGet(item.course_no);
      }
    })
  }

  res_course: any = [];
  arr_band: any;
  async onKeyCourse(event: any) { // console.log(event.target.value);
    if (event.target.value.length >= 11 && event.target.value.length < 12) {
      this.res_course = await this.service.axios_get('CourseOpen/' + event.target.value);
      if (this.res_course != undefined) {
        this.txtcourse_name_en.nativeElement.value = this.res_course.course_name_en;
        this.txtgroup.nativeElement.value = this.res_course.organization.org_abb;
        this.txtqty.nativeElement.value = this.res_course.capacity;
        this.txtdate_from.nativeElement.value = formatDate(this.res_course.date_start).toString() + ' ' + this.res_course.time_in;
        this.txtdate_to.nativeElement.value = formatDate(this.res_course.date_end).toString() + ' ' + this.res_course.time_out;
        this.txtplace.nativeElement.value = this.res_course.place;

        this.arr_band = this.res_course.courses_bands; // console.log(this.arr_band);
        var nameArr = this.res_course.courses_bands; // console.log(nameArr);
        for (const iterator of nameArr) {
          this.array_chk.find(v => v.band === iterator.band).isChecked = true;
        }  // console.log(this.array_chk);
        this.checkboxesDataList = this.array_chk;

        this.fnGet(event.target.value);
      }
    } else if (event.target.value.length < 11) {
      this.txtcourse_name_en.nativeElement.value = "";
      this.txtgroup.nativeElement.value = "";
      this.txtqty.nativeElement.value = "";
      this.txtdate_from.nativeElement.value = "";
      this.txtdate_to.nativeElement.value = "";
      this.txtplace.nativeElement.value = "";
      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
    }

    if (event.target.value.length == 0) {
      await this.fnGet("No");
    }
  }
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

  async fnGetStakeholder(emp_no: any) {
    await this.service.gethttp('Stakeholder/Employee/' + emp_no)
      .subscribe((response: any) => {
        if (response.role.toUpperCase() == environment.role.committee) {
          this._org_abb = response.organization.org_abb;
          this.txtgroup.nativeElement.value = response.organization.org_abb;
          this.fnGet("No");
          this.visableSave = true;
          this.visableUpdate = false;
          this.visableClear = true;
          this.isClose = false;
          this.isIf = true;
        }
      }, (error: any) => {
        console.log(error);
        this.fnGet("No");
        this.visableSave = false;
        this.visableUpdate = false;
        this.visableClear = false;
        this.isClose = true;
        this.isIf = false;
      });
  }

  res_conflict: any;
  async fnGet(course_no) {
    await this.service.gethttp('RegisterScore/GetContinuous/' + course_no)
      .subscribe((response: any) => {
        console.log(response);

        this.data_grid = response;
        this.res_conflict = response;

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

  // Open popup Course
  inputitem = 'register-continuous';
  openCourse(content) {
    //   size: 'lg' //sm, mb, lg, xl
    this.v_course_no = "";
    const modalRef = this.modalService.open(content, { size: 'lg' });
    modalRef.result.then(
      (result) => {
        console.log(result);
        if (result != "OK") {
          this.form.controls['frm_course'].setValue("");
          this.fnGetCourse("NULL");
          this.v_course_no = "";
        }
      },
      (reason) => {
        console.log(reason);
        this.form.controls['frm_course'].setValue("");
        this.fnGetCourse("NULL");
        this.v_course_no = "";
      }
    );
  }

  v_course_no: string = "";
  addItemCourse(newItem: string) {
    this.v_course_no = newItem;
    this.form.controls['frm_course'].setValue(newItem);
    this.fnGetCourse(newItem);
  }

  async fnGetCourse(course_no: any) {
    this.res_course = await this.service.axios_get('CourseOpen/OpenALL/' + course_no);
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
    }
  }
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