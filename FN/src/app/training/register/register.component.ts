import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  data_grid: any = [];
  data_grid_other: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  isDtInitialized: boolean = false

  dtOptionsOther: any = {};
  dtTriggerOther: Subject<any> = new Subject();
  // @ViewChild(DataTableDirective) 
  dtElementOther: DataTableDirective;
  isDtInitializedOther: boolean = false
  // end datatable
  @ViewChild("txtgroup") txtgroup: any;
  @ViewChild("txtqty") txtqty: any;
  @ViewChild("txtdate_from") txtdate_from: any;
  @ViewChild("txtdate_to") txtdate_to: any;
  @ViewChild("txtposition") txtposition: any;
  @ViewChild("txtband") txtband: any;
  @ViewChild("txtdept") txtdept: any;
  checkboxesDataList: any[];
  not_pass: boolean = false;
  visableButton: boolean = false;
  txt_not_pass = '';
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  _org_code: string = "";

  form: FormGroup;
  submitted = false;

  constructor(private modalService: NgbModal, config: NgbModalConfig, private formBuilder: FormBuilder, private service: AppServiceService, private exportexcel: ExportService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        frm_course: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(20)]],
        frm_course_name: ['', [Validators.required]],
        frm_emp_no: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(7)]],
        frm_emp_name: ['', [Validators.required]],
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
      filter: {
        "dom": {
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-left"
          },
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
              }, {
                extend: 'csv',
                text: '<i class="far fa-file-excel"></i> Csv</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> Pdf</button>',
              },
            ]
          }, {
            text: '<i class="fas fa-envelope"></i> Send e-mail</button>',
            key: '1',
            action: () => {
              if (this.visableButton == true) {
                this.fnSendMail();
              }
            }
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          targets: [8],
          orderable: false
        }
      ],
    };
    this.dtOptionsOther = {
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        paginate: {
          next: '<i class="icon ion-ios-arrow-forward"></i>', // or '→'
          previous: '<i class="icon ion-ios-arrow-back"></i>' // or '←' 
        }
      },
      filter: {
        "dom": {
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-left"
          },
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
      container: "#example2_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
    };

    this.fnGetband();
    this.fnGetStakeholder(this._emp_no);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  async fnSave() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    // console.log(JSON.stringify(this.form.value, null, 2));

    // console.log(this.dept_emp);
    // console.log(this._org_abb)
    // console.log(this.div_emp);
    if (this.dept_emp != this._org_abb && this.div_emp != this._org_abb) {
      Swal.fire({
        icon: 'error',
        title: "",
        text: environment.text.invalid_department
        // ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากพนักงานไม่ได้อยู่ใน DEPARTMENT ของคุณ.
      })

      return;
    }

    if (!this.arr_band.some(x => x.band == this.txtband.nativeElement.value)) {
      Swal.fire({
        icon: 'error',
        title: "",
        text: environment.text.unequal_band
        // ไม่สามารถเพิ่มข้อมูลได้ เนื่องจากพนักงานไม่อยู่ใน band ที่กำหนด.
      })

      return;
    }

    const send_data = {
      course_no: this.form.controls['frm_course'].value,
      emp_no: this.form.controls['frm_emp_no'].value,
      last_status: (this.data_grid.length + this.data_grid_other.length) + 1 > this.txtqty.nativeElement.value ? environment.text.wait : null,
      remark: this.txt_not_pass
    }
    // console.log(send_data);
    await this.service.axios_post('Registration', send_data, environment.text.success);
    await this.fnGet(this.form.controls['frm_course'].value, this._org_abb);
  }
  res_mail: any;
  async fnSendMail() {
    if (this.form.controls['frm_course'].value != "") {
      this.res_mail = await this.service.axios_get('OtherData/GetSendMail?org_code=' + this._org_code);
      // console.log(this.res_mail);
      if (this.res_mail.length > 0) {
        const filter_form = this.res_mail.filter(e => e.emp_no == this._emp_no && e.role == environment.role.committee); //console.log(filter_form);
        const filter_to = this.res_mail.filter(e => e.role == environment.role.approver); //console.log(filter_to);
        //console.log(filter_to.map(a => a.email).join());

        Swal.fire({
          title: 'Are you sure? \n you want to send e-mail to',
          text: filter_to.map(a => a.email).join("\n"),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then(async (result) => {
          if (result.value) {
            var formData_M = new FormData();
            let mailform = filter_form[0].email;
            let subject = "Request for approval to participate in the training.";
            formData_M.append('from', mailform);

            let select_data = filter_to.map(a => a.emp_no);
            let emp_to = filter_to.filter(function (item) {
              return select_data.includes(item.emp_no)
            }); //console.log(emp_to);

            for (var i = 0; i < emp_to.length; i++) {
              if (emp_to[i].email != null) {
                //console.log(emp_to[i].email);
                formData_M.append('to', emp_to[i].email);
              }
            }
            let dear = filter_to.map(a => a.fullname); //console.log(dear);
            formData_M.append('subject', "[TEST][HRGIS TRAINING] " + subject);
            formData_M.append('text', "Dear: " + dear + " \n\n" +
              "I would like to notify that your members request to participate in the training.\n" +
              "Please click the link to approve. http://cptsvs52t/HRGIS_TEST \n\n" +
              "Best Regards");
            // var url = "http://cptsvs531:1000/middleware/email/sendmail";
            // this.service.axios_formdata_post(url, formData_M, 'Send mail success.');
          }
        })
      }
    }else{
      Swal.fire({
        icon: 'error',
        text: environment.text.not_sendmail
      })
    }
  }
  fnClear() {
    this.form.controls['frm_emp_no'].setValue("");
    this.form.controls['frm_emp_name'].setValue("");
    this.txtdept.nativeElement.value = "";
    this.txtposition.nativeElement.value = "";
    this.txtband.nativeElement.value = "";
    this.txt_not_pass = "";
  }
  fnDelete(item) {
    // console.log('fn_delete', item);
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to delete this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.value) {
        await this.service.axios_delete('Registration/' + item.course_no + '/' + item.emp_no + '/' + this.txtqty.nativeElement.value, environment.text.delete);
        this.fnGet(item.course_no, this._org_abb);
      }
    })
  }

  res_course: any = [];
  arr_band: any;
  async onKeyCourse(event: any) { // console.log(event.target.value);
    if (event.target.value.length >= 11 && event.target.value.length < 12) {
      this.res_course = await this.service.axios_get('CourseOpen/Open/' + event.target.value);
      console.log(this.res_course);

      if (this.res_course != undefined) {
        this.form.controls['frm_course_name'].setValue(this.res_course.course_name_en);
        this.txtgroup.nativeElement.value = this.res_course.org_code;
        this.txtqty.nativeElement.value = this.res_course.capacity;
        // this.txtdate_from.nativeElement.value = formatDate(this.res_course.date_start).toString() + ' ' + displayTime(this.res_course.time_in);
        // this.txtdate_to.nativeElement.value = formatDate(this.res_course.date_end).toString() + ' ' + displayTime(this.res_course.time_out);
        this.txtdate_from.nativeElement.value = formatDate(this.res_course.date_start).toString() + ' ' + this.res_course.time_in.substring(0, 5);
        this.txtdate_to.nativeElement.value = formatDate(this.res_course.date_end).toString() + ' ' + this.res_course.time_out.substring(0, 5);

        this.arr_band = this.res_course.courses_bands; // console.log(this.arr_band);

        var nameArr = this.res_course.courses_bands; // console.log(nameArr);
        for (const iterator of nameArr) {
          this.array_chk.find(v => v.band === iterator.band).isChecked = true;
        } // console.log(this.array_chk);
        this.checkboxesDataList = this.array_chk;

        this.fnGet(event.target.value, this._org_abb);
      }
    } else if (event.target.value.length < 11) {
      this.form.controls['frm_course_name'].setValue("");
      this.txtgroup.nativeElement.value = "";
      this.txtqty.nativeElement.value = "";
      this.txtdate_from.nativeElement.value = "";
      this.txtdate_to.nativeElement.value = "";
      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
      this.fnClear();
    }

    if (event.target.value.length == 0) {
      await this.fnGet("No", "No");
    }
  }

  onKeyEmpno(event: any) {
    if (event.target.value.length >= 6 && event.target.value.length <= 7) {
      this.searchEmp(event.target.value);
      this.searchPrevCourse(event.target.value);
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
  res_prev: any;
  async searchPrevCourse(empno: any) {
    let frm = this.form.value;
    this.res_prev = await this.service.axios_get('Registration/GetPrevCourse/' + frm.frm_course + '/' + empno); // console.log('searchPrevCourse: ', this.res_prev);
    if (this.res_prev != "" || this.res_prev != null) {
      this.txt_not_pass = this.res_prev;
      this.not_pass = true;
    }
  }

  /** File Upload, Download */
  dowloadFormat() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'assets/format/format input training.xlsx');
    link.setAttribute('download', `format input training.xlsx`);
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
      // console.log(this.file);
      // console.log(this.fileName);
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
      formData.append('capacity', this.txtqty.nativeElement.value)

      this.result = await this.service.axios_formdata_post('/Registration/UploadCourseRegistration/' + this.form.controls['frm_course'].value, formData, environment.text.success);
      // console.log('result: ', this.result.data);
      if (this.result.data.length > 0) {
        let element = this.result.data;
        this.exportexcel.exportJSONToExcel(element, 'ResultRegistration');
      }

      this.customFile.nativeElement.value = ""; // console.log(this.file); // console.log(this.fileName);
      this.nameFile = 'Choose file';
      await this.fnGet(this.form.controls['frm_course'].value, this._org_abb);
    }
  }
  /** End File Upload, Download */

  async fnGetStakeholder(emp_no: any) {
    await this.service.gethttp('Stakeholder/Employee/' + emp_no)
      .subscribe((response: any) => {
        if (response.role.toUpperCase() == environment.role.committee) {
          this._org_abb = response.organization.org_abb;
          this._org_code = response.organization.org_code;
          this.txtgroup.nativeElement.value = response.organization.org_abb;
          this.fnGet("No", "No");
          this.visableButton = true;
        }
      }, (error: any) => {
        console.log(error);
        this.fnGet("No", "No");
        this.visableButton = false;
      });
  }

  async fnGet(course_no, dept_abb) {
    let self = this
    await this.service.gethttp('Registration/GetGridView/' + course_no + '/' + dept_abb)
      .subscribe((response: any) => {
        this.data_grid = response.your;
        this.data_grid_other = response.other;

        console.log(this.dtElement);
        console.log(this.dtElementOther);

        console.log(self.dtElement);
        console.log(self.dtElementOther);

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

        if (this.isDtInitializedOther) {
          this.dtElementOther.dtInstance.then((dtInstance1: DataTables.Api) => {
            dtInstance1.destroy();
            this.dtTriggerOther.next();
          });
        } else {
          this.isDtInitializedOther = true
          this.dtTriggerOther.next();
        }

      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
        this.data_grid_other = [];
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

  // Open popup Course
  inputitem = 'register';
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
    this.res_course = await this.service.axios_get('CourseOpen/Open/' + course_no);
    console.log('fnGetCourse: ', this.res_course);
    if (this.res_course != undefined) {
      this.form.controls['frm_course_name'].setValue(this.res_course.course_name_en);
      this.txtgroup.nativeElement.value = this.res_course.organization.org_abb;
      this.txtqty.nativeElement.value = this.res_course.capacity;
      this.txtdate_from.nativeElement.value = formatDate(this.res_course.date_start).toString() + ' ' + this.res_course.time_in.substring(0, 5);
      this.txtdate_to.nativeElement.value = formatDate(this.res_course.date_end).toString() + ' ' + this.res_course.time_out.substring(0, 5);

      this.arr_band = this.res_course.courses_bands; // console.log(this.arr_band);

      var nameArr = this.res_course.courses_bands; // console.log(nameArr);
      for (const iterator of nameArr) {
        this.array_chk.find(v => v.band === iterator.band).isChecked = true;
      } // console.log(this.array_chk);
      this.checkboxesDataList = this.array_chk;

      this.fnGet(course_no, this._org_abb);
    } else {
      this.form.controls['frm_course_name'].setValue("");
      this.txtgroup.nativeElement.value = "";
      this.txtqty.nativeElement.value = "";
      this.txtdate_from.nativeElement.value = "";
      this.txtdate_to.nativeElement.value = "";
      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
      await this.fnGet("No", "No");
    }
  }
  // End Open popup Course

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTriggerOther.unsubscribe();
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
function displayTime(ticksInSecs) {
  // console.log(ticksInSecs);
  var min = ticksInSecs.Minutes < 10 ? "0" + ticksInSecs.Minutes : ticksInSecs.Minutes;
  var sec = ticksInSecs.Seconds < 10 ? "0" + ticksInSecs.Seconds : ticksInSecs.Seconds;
  var hour = ticksInSecs.Hours < 10 ? "0" + ticksInSecs.Hours : ticksInSecs.Hours;
  // return hour + ':' + min + ':' + sec;
  return hour + ':' + min;
}

export interface PeriodicElement {
  emp_no: string;
  title_name_en: string;
  firstname_en: string;
  lastname_en: string;
  position_name_en: string;
  band: string;
  dept_code: string;
  dept_abb_name: string;
  last_status: string;
  remark: string;
  course_name_en: string;
}

const ELEMENT_DATA: PeriodicElement[] = [];

const ELEMENT_DATA_OTHER: PeriodicElement[] = [];