import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-course-open',
  templateUrl: './course-open.component.html',
  styleUrls: ['./course-open.component.scss']
})
export class CourseOpenComponent implements OnInit {
  today: any = Date.now();
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable
  ddl_hh: any = [];
  ddl_mm: any = [];
  _getjwt: any;
  _emp_no: any;
  _ogr_abb: string = "";
  _ogr_code: string = "";
  @ViewChild("txtgroup") txtgroup;
  @ViewChild("txtdate_from") txtdate_from;
  @ViewChild("txtdate_to") txtdate_to;
  form: FormGroup;
  submitted = false;
  isreadonly = false;
  visableSave = false;
  visableUpdate = false;
  visableClear = false;
  open_regis: boolean = false;
  chk_disable: boolean = false;
  isdisabled: boolean = true;
  value_trainer: any;
  selected_trainer_multiple: string[];

  constructor(private modalService: NgbModal, config: NgbModalConfig, public activeModal: NgbActiveModal, private formBuilder: FormBuilder, private service: AppServiceService) {
    // popup
    config.backdrop = 'static';
    config.keyboard = false;
  }

  // unamePattern = "^[a-z0-9_-]{8,15}$";
  // pwdPattern = "^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{6,12}$";
  // mobnumPattern = "^((\\+91-?)|0)?[0-9]{10}$"; 
  // emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";

  // 0123456789`~!@#$%^&*()-_=+[]{}\|;:'"<>,./?
  // abcdefghijklmnopqrstuvwxyz
  // ABCDEFGHIJKLMNOPQRSTUVWXYZ

  th_pattern = "^[ก-๛0-9\\s`~/!@#$%^&*()-_=+{}\|;:\'\"<>,./?]+$";
  en_pattern = new RegExp('^[a-zA-Z0-9\\s`~/!@#$%^&*()-_=+{}\|;:\'\"<>,./?]+$');

  ngOnInit() {
    this.form = this.formBuilder.group(
      {
        frm_course: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(20)]],
        frm_course_th: ['', [Validators.required, Validators.pattern(this.th_pattern)]],
        frm_course_en: ['', [Validators.required, Validators.pattern(this.en_pattern)]],
        frm_day: ['', [Validators.required]],
        frm_qty: ['', [Validators.required]],
        frm_time_in_hh: ['', [Validators.required]],
        frm_time_in_mm: ['', [Validators.required]],
        frm_time_out_hh: ['', [Validators.required]],
        frm_time_out_mm: ['', [Validators.required]],
        frm_place: ['', [Validators.required]],
        frm_trainer: ['', [Validators.required]]
      },
    );

    for (var i = 0; i <= 23; i++) {
      let theOption: any = {};
      theOption.name = ("0" + i).slice(-2).toString();
      theOption.value = i.toString();
      this.ddl_hh.push(theOption);
    }
    for (var i = 0; i <= 55; i++) {
      let theOption: any = {};
      theOption.name = ("0" + (i)).slice(-2).toString();
      theOption.value = i.toString();
      this.ddl_mm.push(theOption);
      i = i + 4;
    }

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no

    this.dtOptions = {
      dom: "<'row'<'col-sm-11 col-md-3 offset-1'f><'col-sm-12 col-md-8'B>>" +
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
      order: [[0, 'asc']],
      // responsive: true,
      autoWidth: false,
      columnDefs: [
        {
          targets: [9],
          orderable: false,
        },
        {
          targets: [7],
          orderable: false,
          width: "15%"
        }
      ],
      // deferRender: true,
      // scrollX: true,
      // scrollCollapse: true,
      // scroller: true,
      // "responsive": true,
    };

    this.fnGetTrainer();
    this.fnGetband();
    this.fnGetStakeholder(this._emp_no);
    this.fnGetCenter(this._emp_no);
  }
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngAfterViewInit() {
    this.txtgroup.nativeElement.value = this._ogr_abb;
    this.txtdate_to.nativeElement.value = formatDate(this.today).toString();
    this.txtdate_from.nativeElement.value = formatDate(this.today).toString();
  }

  async fnSave() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    // console.log(JSON.stringify(this.form.value, null, 2));
    // console.log(this.form.value);

    let frm = this.form.value;
    if (frm.frm_course.length >= 11) {
      const send_data = {
        course_no: frm.frm_course,
        course_name_th: frm.frm_course_th,
        course_name_en: frm.frm_course_en,
        org_code: this.txtgroup.nativeElement.value,
        days: frm.frm_day,
        capacity: frm.frm_qty,
        open_register: this.open_regis,
        band: this.checkedIDs,  // ["E", "J1"]
        date_start: this.txtdate_from.nativeElement.value,
        date_end: this.txtdate_to.nativeElement.value,
        time_in: ("0" + (frm.frm_time_in_hh)).slice(-2).toString() + ":" + ("0" + (frm.frm_time_in_mm)).slice(-2).toString(),
        time_out: ("0" + (frm.frm_time_out_hh)).slice(-2).toString() + ":" + ("0" + (frm.frm_time_out_mm)).slice(-2).toString(),
        place: frm.frm_place,
        trainer: frm.frm_trainer, // [1,2,3,6]
      }
      console.log('send data: ', send_data);

      await this.service.axios_post('/CourseOpen/Posttr_course', send_data, 'Update data success.');
      this.fnGet(this._ogr_code);
    }
  }
  fnClear() {
    this.form.controls['frm_course'].setValue("");
    this.form.controls['frm_course_th'].setValue("");
    this.form.controls['frm_course_en'].setValue("");
    this.form.controls['frm_day'].setValue("");
    this.form.controls['frm_qty'].setValue("");
    this.txtgroup.nativeElement.value = "ICD";
    this.txtdate_to.nativeElement.value = formatDate(this.today).toString();
    this.txtdate_from.nativeElement.value = formatDate(this.today).toString();
    this.form.controls['frm_time_in_hh'].setValue("");
    this.form.controls['frm_time_in_mm'].setValue("");
    this.form.controls['frm_time_out_hh'].setValue("");
    this.form.controls['frm_time_out_mm'].setValue("");
    this.form.controls['frm_place'].setValue("");
    this.form.controls['frm_trainer'].setValue("");
    this.open_regis = false;
    this.checkboxesDataList.forEach((value, index) => {
      value.isChecked = false;
    });
    this.checkedIDs = [];
    this.selected_trainer_multiple = [];

    this.isreadonly = false;
    this.isdisabled = true;
    this.visableSave = true;
    this.visableUpdate = false;
    this.visableClear = true;
  }
  CheckDate(date_end) {
    let result = true;
    let date: Date = new Date(date_end);
    date.setDate(date.getDate() + 5); //console.log('add date: ', formatDate(date));

    var maxDate = new Date(date);
    var currentDate = new Date(); //console.log('วันปัจจุบัน: ', formatDate(currentDate));
    if (currentDate.setHours(0, 0, 0, 0) > maxDate.setHours(0, 0, 0, 0)) {
      //console.log('วันปัจจุบัน > txt date_end: ', formatDate(currentDate) + ' > ' + formatDate(maxDate));
      result = false;
    }
    else {
      //console.log('วันปัจจุบัน <= txt date_end: ', formatDate(currentDate) + ' <= ' + formatDate(maxDate));
      result = true;
    }

    return result;
  }
  fnEdit(item) {
    this.isreadonly = true;
    this.isdisabled = false;
    this.visableSave = false;
    this.visableUpdate = true;

    this.form.controls['frm_course'].setValue(item.course_no);
    this.form.controls['frm_course_th'].setValue(item.course_name_th);
    this.form.controls['frm_course_en'].setValue(item.course_name_en);
    this.form.controls['frm_day'].setValue(item.days);
    this.form.controls['frm_qty'].setValue(item.capacity);
    this.txtgroup.nativeElement.value = item.org_code;
    this.txtdate_from.nativeElement.value = formatDate(item.date_start).toString();
    this.txtdate_to.nativeElement.value = formatDate(item.date_end).toString();
    this.form.controls['frm_place'].setValue(item.place);
    this.open_regis = item.open_register;// console.log(item.open_register);

    this.array_chk.forEach(object => {
      object.isChecked = false; // reset isChecked => false
    }); //console.log(this.array_chk);
    for (const iterator of item.band) {
      this.array_chk.find(v => v.band === iterator).isChecked = true;
    }
    this.checkboxesDataList = this.array_chk;

    this.fetchCheckedIDs();
    this.form.controls['frm_time_in_hh'].setValue(parseInt(item.time_in.substr(0, 2)).toString());
    this.form.controls['frm_time_in_mm'].setValue(parseInt(item.time_in.substr(3, 2)).toString());
    this.form.controls['frm_time_out_hh'].setValue(parseInt(item.time_out.substr(0, 2)).toString());
    this.form.controls['frm_time_out_mm'].setValue(parseInt(item.time_out.substr(3, 2)).toString());

    let array = []; this.selected_trainer_multiple = [];
    console.log('item.trainer: ',item.trainer);
    console.log('value_trainer: ',this.value_trainer);
    
    for (const iterator of item.trainer) {
      var newArray = this.value_trainer.filter(function (el) {
        return el.fulls == iterator;
      });
      array.push(newArray[0].trainer_no);
    }  console.log('array: ', array);
    this.selected_trainer_multiple = array; // this.selected_trainer_multiple = ["014748","013380"];
  }
  async fnUpdate() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    // console.log(JSON.stringify(this.form.value, null, 2));
    // console.log(this.form.value);

    let frm = this.form.value;
    const send_data = {
      course_no: frm.frm_course,
      course_name_th: frm.frm_course_th,
      course_name_en: frm.frm_course_en,
      org_code: this.txtgroup.nativeElement.value,
      days: frm.frm_day,
      capacity: frm.frm_qty,
      open_register: this.open_regis,
      band: this.checkedIDs,  // ["E", "J1"]
      date_start: this.txtdate_from.nativeElement.value,
      date_end: this.txtdate_to.nativeElement.value,
      time_in: ("0" + (frm.frm_time_in_hh)).slice(-2).toString() + ":" + ("0" + (frm.frm_time_in_mm)).slice(-2).toString(),
      time_out: ("0" + (frm.frm_time_out_hh)).slice(-2).toString() + ":" + ("0" + (frm.frm_time_out_mm)).slice(-2).toString(),
      place: frm.frm_place,
      trainer: frm.frm_trainer, // [1,2,3,6]
    }
    console.log('send data: ', send_data);

    await this.service.axios_put('/CourseOpen/' + frm.frm_course, send_data, 'Update data success.');
    this.fnGet(this._ogr_code);
  }
  async fnDelete(item) {
    Swal.fire({
      icon: 'warning',
      title: 'Do you sure to delete this record?',
      text: 'Please confirm by enter Course No: ' + item.course_no + '. and press confirm Course no.',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: (result) => {
        // console.log(result);
        if (result == "" || result == null || result == undefined) {
          Swal.showValidationMessage(
            `Request failed!`
          )
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (item.course_no === result.value) {
          await this.service.axios_delete('CourseOpen/' + result.value, 'Delete data success.');
          this.fnGet(this._ogr_code);
          this.fnClear();
        } else {
          // console.log(item.course_no);
          // console.log(result.value);
          Swal.fire({
            icon: 'error',
            text: 'Courses no do not match.'
          })
        }
      }
    })
  }

  // Open popup trainer
  open(content) {
    this.modalService.open(content, {
      size: 'xl' //sm, mb, lg, xl
    });
  } // End Open popup trainer

  // Open popup Course
  inputitem = 'course-open';
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
  } // End Open popup Course

  // Check box All
  onNgModelChange(e) {
    // console.log(e);
    // ถ้ามีการเลือก check box All ให้ส่ง All ไป เพื่อค้นหาข้อมูลของแผนกอื่นได้ แต่แก้ไขไม่ได้
    if (e) {
      this.fnGet(environment.text.all);
    }
    else {
      this.fnGet("");
    }
  } // EndCheck box All

  v_course_no: string = "";
  addItemCourse(newItem: string) {
    this.v_course_no = newItem;
    this.form.controls['frm_course'].setValue(newItem);
    this.fnGetCourse(newItem);
  }

  response: any = [];
  async onKeyCourse(event: any) {  // console.log(event.target.value.length);
    if (event.target.value.length >= 7 && event.target.value.length < 8) {
      this.fnGetCourse(event.target.value);
    } else if (event.target.value.length < 7) {
      this.form.controls['frm_course_th'].setValue("");
      this.form.controls['frm_course_en'].setValue("");
      this.form.controls['frm_day'].setValue("");
      this.form.controls['frm_qty'].setValue("");
      this.txtgroup.nativeElement.value = "";
      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
      this.isdisabled = true;
    }
  }

  // date
  onDateSelectTo(event) {
    console.log('onDateSelectTo: ', event);
  }
  onDateSelectFrom(event) {
    console.log('onDateSelectFrom: ', event);
  } // End date

  // Multiple Checkbox
  selectedItemsList = [];
  checkedIDs = [];
  checkboxesDataList: any[];
  // checkboxesDataList = [
  //   { label: "E", isChecked: false },
  //   { label: "J1", isChecked: false },
  //   { label: "J2", isChecked: false },
  //   { label: "J3", isChecked: false },
  //   { label: "J4", isChecked: false },
  //   { label: "M1", isChecked: false },
  //   { label: "M2", isChecked: false }
  // ]
  changeSelection() {
    this.fetchSelectedItems();
    this.fetchCheckedIDs();
  }
  fetchSelectedItems() {
    this.selectedItemsList = this.checkboxesDataList.filter((value, index) => {
      return value.isChecked;
    });
  }
  fetchCheckedIDs() {
    this.checkedIDs = []
    this.checkboxesDataList.forEach((value, index) => {
      if (value.isChecked) {
        this.checkedIDs.push(value.band);
      }
    });
    // console.log('checkedIDs: ', this.checkedIDs);
  }
  // End Multiple Checkbox

  async fnGetStakeholder(emp_no: any) {
    await this.service.gethttp('Stakeholder/Employee/' + emp_no)
      .subscribe((response: any) => {
        console.log(response);
        if (response.role.toUpperCase() == environment.role.committee) {
          this._ogr_abb = response.organization.org_abb;
          this._ogr_code = response.organization.org_code;
          this.txtgroup.nativeElement.value = this._ogr_abb;
          this.fnGet(this._ogr_code);
          this.visableSave = true;
          this.visableUpdate = false;
          this.visableClear = true;
        }
      }, (error: any) => {
        console.log(error);
        this.fnGet(this._ogr_code);
        this.visableSave = false;
        this.visableUpdate = false;
        this.visableClear = false;
      });
  }
  async fnGetCenter(emp_no: any) {
    await this.service.gethttp('Center/' + emp_no)
      .subscribe((response: any) => {
        this.chk_disable = true;
        this.fnGet(this._ogr_code);
      }, (error: any) => {
        console.log(error);
        this.chk_disable = false;
      });
  }

  async fnGetCourse(course_no: any) {
    this.response = await this.service.axios_get('CourseMasters/SearchCourse/' + course_no + '/' + this._ogr_code);
    console.log('fnGetCourse: ', this.response);
    if (this.response != undefined) {
      this.form.controls['frm_course_th'].setValue(this.response.course_name_th);
      this.form.controls['frm_course_en'].setValue(this.response.course_name_en);
      this.form.controls['frm_day'].setValue(this.response.days);
      this.form.controls['frm_qty'].setValue(this.response.capacity);
      this.txtgroup.nativeElement.value = this.response.org_code;

      var nameArr = this.response.master_courses_bands; // console.log(nameArr);
      this.array_chk.forEach(object => {
        object.isChecked = false; // reset isChecked => false
      }); //console.log(this.array_chk);
      for (const iterator of nameArr) {
        this.array_chk.find(v => v.band === iterator.band).isChecked = true;
      } // console.log(this.array_chk);
      this.checkboxesDataList = this.array_chk;
      this.fetchCheckedIDs();      

      this.isdisabled = false;
    } else {
      this.form.controls['frm_course_th'].setValue("");
      this.form.controls['frm_course_en'].setValue("");
      this.form.controls['frm_day'].setValue("");
      this.form.controls['frm_qty'].setValue("");
      this.txtgroup.nativeElement.value = "";
      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
      this.isdisabled = true;
    }
  }

  async fnGet(dept: any) {
    await this.service.gethttp('CourseOpen/GetGridView/' + dept)
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
      });
  }

  async fnGetTrainer() {
    this.value_trainer = await this.service.axios_get('Trainers/FullTrainers'); // console.log('fnGetTrainer: ', this.value_trainer);
  }

  array_chk: any;
  async fnGetband() {
    this.array_chk = await this.service.axios_get('Bands'); //console.log(this.array_chk);
    this.array_chk.forEach(object => {
      object.isChecked = false; // set isChecked => false
    }); //console.log(this.array_chk);
    this.checkboxesDataList = this.array_chk; //console.log(this.checkboxesDataList);
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