import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import axios from 'axios';

@Component({
  selector: 'app-approve-mgr',
  templateUrl: './approve-mgr.component.html',
  styleUrls: ['./approve-mgr.component.scss']
})
export class ApproveMgrComponent implements OnInit {

  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }

  data_grid: any = [];
  data_grid_other: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  dtOptionsOther: any = {};
  dtTriggerOther: Subject<any> = new Subject();
  // @ViewChild(DataTableDirective)
  dtElementOther: DataTableDirective;
  isDtInitializedOther: boolean = false
  // end datatable
  @ViewChild("txtgroup") txtgroup: any;
  @ViewChild("txtqty") txtqty: any;
  v_capacity = 0;
  @ViewChild("txtdate_from") txtdate_from: any;
  @ViewChild("txtdate_to") txtdate_to: any;
  @ViewChild("txtposition") txtposition: any;
  @ViewChild("txtband") txtband: any;
  @ViewChild("txtdept") txtdept: any;
  not_pass: boolean = false;
  disabled_chkall: boolean = false;
  visableButton: boolean = false;
  isreadonly: boolean = true;
  isIf: boolean = false;
  txt_not_pass = '';
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  checkboxesDataList: any[];
  form: FormGroup;
  submitted = false;
  is_approver: boolean;
  _org_code: any;

  approver_org_code: string;
  errors: any;
  
  course_no:string;
  course: any={};
  courses: any=[];
  response: any;

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
            className: "btn btn-sm"
          },
        },
        "buttons": [
          {
            extend: 'pageLength',
            className: 'btn-outline-indigo'
          },
          {
            extend: 'copy',
            text: '<i class="fas fa-copy"></i> Copy</button>',
            className: 'btn-outline-indigo'
          },
          {
            extend: 'print',
            text: '<i class="fas fa-print"></i> Print</button>',
            className: 'btn-outline-indigo'
          },
          {
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            className: 'btn-outline-indigo',
            buttons: [
              {
                extend: 'excel',
                text: '<i class="far fa-file-excel"></i> Excel</button>',
              }
            ]
          },
          {
            text: '<i class="fas fa-check"></i> Approve</button>',
            className: 'btn-indigo',
            key: '1',
            action: () => {
              // ถ้า Mgr. กด Approve ให้ส่งเมล์หา committee ด้วย
              if (this.visableButton == true) {
                this.fnApproved();
              }
            }
          } 
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
      order: [[1, 'asc']],
      columnDefs: [
        {
          targets: [0, 9],
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
              /*{
                extend: 'csv',
                text: '<i class="far fa-file-excel"></i> Csv</button>',
              },
              {
                extend: 'pdf',
                text: '<i class="far fa-file-pdf"></i> Pdf</button>',
              },*/
            ]
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
    };

    this.check_is_approver()
  }

  async check_is_approver() {
    let self = this
    await this.service.gethttp('Stakeholder/approver/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_approver = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.visableButton = true;
        self.isreadonly = false;
        self.get_courses()
      }, (error: any) => {
        console.log(error);
        self.is_approver = false;
        self.visableButton = false;
        self.isreadonly = true;
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
          let trainers = self.response.trainers
          if(trainers.length>0){
            self.course.trainer_text = trainers.map(c => c.display_name).join(', ');
          }
          else{
            self.course.trainer_text = "-"
          }
          self.get_courses()
          // self.datatable()
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

async get_courses(){
  let self = this
  await axios.get(`${environment.API_URL}Courses/Owner/${this._org_code}/Open`, this.headers)
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

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  async fnSave() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }
    // console.log(JSON.stringify(this.form.value, null, 2));

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
      course_no: this.course_no,
      emp_no: this.form.controls['frm_emp_no'].value,
      last_status: (this.data_grid.length + this.data_grid_other.length) + 1 > this.txtqty.nativeElement.value ? environment.text.wait : null,
      remark: this.txt_not_pass
    }
    // console.log(send_data);
    await this.service.axios_post('Registration', send_data, environment.text.success);
    // await this.fnGet(this.course_no, this._org_abb);
    await this.fnGet();
  }
  async fnApproved() {
    let text = "";
    if (this.array_grid.length > 0) 
    {
      text = "you want to approve these trainees";
    } 
    else 
    {
      text = "you want to cancle approve these trainees"
    }

    Swal.fire({
      title: 'Are you sure?',
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then(async (result) => {
      if (result.value) {

        for (var i = 0; i < this.data_grid.length; i++) {
          this.data_grid[i].manager_approved_checked = false;
        }

        for (const iterator of this.array_grid) {
          let _objIndex = this.data_grid.findIndex((obj => obj.emp_no == iterator.emp_no));
          this.data_grid[_objIndex].manager_approved_checked = true;
        }

        Array.prototype.push.apply(this.array_grid, this.data_grid); // console.log(this.array_grid);
        this.array_grid = removeDuplicateObjectFromArray(this.array_grid, 'emp_no'); // console.log(removeDuplicateObjectFromArray(this.array_grid, 'emp_no'));

        const send_data = {
          course_no: this.course_no,
          capacity: this.course.capacity,
          array: this.array_grid
        }
        console.log('send data: ', send_data);

        this.selection.clear();
        this.array_grid = [];
        await this.service.axios_put('/Registration/MgrApprove/' + this.course_no, send_data, environment.text.success);
        await this.fnGet();
      }
    })
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
        // this.fnGet(item.course_no, this._org_abb);
        this.fnGet();
      }
    })
  }

  res_course: any = [];
  arr_band: any;

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
      console.log(this.file);
      console.log(this.fileName);
      this.nameFile = this.fileName;
    }
  }
  result: any;
  async upload() {
    if (this.course_no == "") {
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

    let formData = new FormData();
    if (this.customFile.nativeElement.value !== undefined && this.customFile.nativeElement.value !== "" && this.customFile.nativeElement.value !== null) {
      formData.append('file_form', this.file)
      formData.append('file_name', this.fileName)
      formData.append('dept_abb', this._org_abb)
      formData.append('capacity', this.txtqty.nativeElement.value)

      this.result = await this.service.axios_formdata_post('/Registration/UploadCourseRegistration/' + this.course_no, formData, environment.text.success);
      // console.log('result: ', this.result.data);
      if (this.result.data.length > 0) {
        let element = this.result.data;
        this.exportexcel.exportJSONToExcel(element, 'ResultRegistration');
      }

      this.customFile.nativeElement.value = ""; // console.log(this.file); // console.log(this.fileName);
      this.nameFile = 'Choose file';
      // await this.fnGet(this.course_no, this._org_abb);
      await this.fnGet();
    }

  }
  /** End File Upload, Download */

  // Start Check box
  selection = new SelectionModel<PeriodicElement>(true, []);
  array_grid = [];
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data_grid.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.data_grid);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      this.array_grid = this.selection.selected;

      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.emp_no + 1}`;
  }

  _checkbox: any = 0;
  toggleSelection(row) {
    // this.selection.toggle(row);
    // this.array_grid = this.selection.selected;

    if ((this.selection.selected.length < this.course.capacity) || this.selection.isSelected(row)) {
      this.selection.toggle(row);
    }

    this.array_grid = this.selection.selected;
    // console.log(this.array_grid);

    // console.log('1: ',this.array_grid.length);
    // console.log('2: ',this.data_grid_other.filter(x => x.center_approved_checked == true).length);
    this._checkbox = this.array_grid.length + this.data_grid_other.filter(x => x.final_approved_checked == true).length;
    // console.log('3: ',this._checkbox);
  }
  // End Check box

  // async fnGet(course_no, dept_abb) {

    async fnGet() {
    await this.service.gethttp('Registration/GetGridView/' + this.course_no + '/' + this._org_code)
      .subscribe((response: any) => {
        // console.log(response);
        this.data_grid = response.your;
        this.data_grid_other = response.other;

        let chk_true = response.your.filter(x => x.manager_approved_checked == true);
        if (chk_true.length > 0) {
          this.selection = new SelectionModel<PeriodicElement>(true, chk_true)
          console.log("1", this.selection.selected);
        }
        else{
          this.selection = new SelectionModel<PeriodicElement>(true, []);
          console.log("2", this.selection.selected);
        }

        if (response.your.filter(x => x.manager_approved_checked == true).length > 0) { this.disabled_chkall = true; } else { this.disabled_chkall = false; }

        // console.log('1: ',this.data_grid.filter(x => x.center_approved_checked == true).length);
        // console.log('2: ',this.data_grid_other.filter(x => x.center_approved_checked == true).length);
        this._checkbox = this.data_grid.filter(x => x.final_approved_checked == true).length + this.data_grid_other.filter(x => x.final_approved_checked == true).length;
        // console.log('3: ',this._checkbox);

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

        if (this.isDtInitializedOther) {
          this.dtElementOther.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
            dtInstance.destroy();
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

  async fnGetCourse(course_no: any) {
    this.res_course = await this.service.axios_get('Courses/Open/' + course_no);
    console.log('fnGetCourse: ', this.res_course);
    this.fnGet();
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
function removeDuplicateObjectFromArray(array, key) {
  return array.filter((obj, index, self) =>
    index === self.findIndex((el) => (
      el[key] === obj[key]
    ))
  )
}

export interface PeriodicElement {
  band: string;
  final_approved_checked: boolean;
  course_name_en: string;
  course_no: string;
  dept_abb: string;
  dept_code: string;
  emp_no: string;
  firstname_en: string;
  lastname_en: string;
  last_status: string;
  manager_approved_checked: boolean;
  position_code: string;
  position_name_en: string;
  remark: string;
  seq_no: number;
  title_name_en: string;
}