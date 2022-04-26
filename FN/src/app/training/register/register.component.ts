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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

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
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  isDtInitialized: boolean = false

  dtOptionsOther: any = {};
  dtTriggerOther: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) dtElementOther: DataTableDirective;
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
  txt_not_pass = "";
  emp_no: string = "";
  emp_name: string = "";
  checkboxesDataList: any[];
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  _org_code: string = "";

  submitted = false;
  committee: any;

  has_committee: boolean = false;
  committee_org_code: string;
  is_committee: boolean;
  errors: any;
  
  course_no:string=null;
  course: any={};
  courses: any=[];
  response: any;
  emp_status: any;

  constructor(private modalService: NgbModal, config: NgbModalConfig, private formBuilder: FormBuilder, private service: AppServiceService, private exportexcel: ExportService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no

    this.check_is_committee()

    this.get_committee_of_emp_no();
    this.get_courses_open()
  }

  async get_committee_of_emp_no() {
    let self = this
    await axios.get(`${environment.API_URL}Stakeholder/Committee/Belong/${this._emp_no}`, this.headers)
    .then(function (response) {
      self.committee = response
      self.committee_org_code = self.committee.org_code
      self.has_committee = true;
    })
    .catch(function (error) {
      console.log(error);
      self.service.sweetalert_error(error)
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
        self.isreadonly = false;
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
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
          self.arr_band = self.response.courses.courses_bands;
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
          self.fnGet()
          self.datatable()
        })
        .catch(function(error){
          self.service.sweetalert_error(error)
          self.course = {};
          return false;
      });      
    }
  }

async get_courses_open(){
  let self = this
  await axios.get(`${environment.API_URL}Courses/Open`, this.headers)
  .then(function(response){
    self.courses = response
    self.course_no = 'AOF-001-001'
    self.get_course()
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


  async fnSave() {
    this.submitted = true;


    const send_data = {
      course_no: this.course_no,
      emp_no: this.emp_no,
      last_status: (this.data_grid.length + this.data_grid_other.length) + 1 > this.course.capacity ? environment.text.wait : null,
      remark: this.txt_not_pass
    }
    // console.log(send_data);
    // await this.service.axios_post('Registration', send_data, environment.text.success);
    // await this.fnGet(this.form.controls['frm_course'].value);
    let self = this
    await axios.post(`${environment.API_URL}Registration/ByCommitteeEmp`, send_data, this.headers)
    .then(function(response){
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: "Success",
        showConfirmButton: false,
        timer: 2000
      })
      self.fnGet();
      self.fnClear()
    })
    .catch(function(error){
      self.errors = error.response.data.errors
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: typeof error.response.data === 'object'? error.response.data.title:error.response.data
      })
      // self.fnGet(self.course_no);
    })
  }

  fnClear() {
    this.errors = {}
    this.emp_no = "";
    this.emp_name = "";
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
        await this.service.axios_delete(`Registration/${item.course_no}/${item.emp_no}`, environment.text.delete);
        this.fnGet();
      }
    })
  }

  res_course: any = [];
  arr_band: any;

  onKeyEmpno(event: any) {
    if (this.emp_no.length >= 6 && this.emp_no.length <= 7) {
      this.searchEmp(this.emp_no);
      this.searchPrevCourse(this.emp_no);
    } else if (this.emp_no.length == 0) {
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
  async searchPrevCourse(empno: any) {
    this.res_prev = await this.service.axios_get('Registration/GetPrevCourse/' + this.course_no + '/' + empno); // console.log('searchPrevCourse: ', this.res_prev);
    if (this.res_prev != "" || this.res_prev != null) {
      this.txt_not_pass = this.res_prev;
      this.not_pass = true;
    }
  }

  datatable(){
    this.dtOptions = {
      destroy: true,
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
        ],
      },
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
      destroy: true,
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
            ]
          }
        ],
      },
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
    };
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


  async fnGet() {
    await this.service.gethttp('Registration/GetGridView/' + this.course_no + '/' + this._org_code)
      .subscribe((response: any) => {
        // console.log(response);
        this.data_grid = response.your;
        this.data_grid_other = response.other;

        let chk_true = response.your.filter(x => x.last_status=="Approved");
        if (chk_true.length > 0) {
          this.selection = new SelectionModel<PeriodicElement>(true, chk_true)
          console.log("1", this.selection.selected);
        }
        else
        {
          this.selection = new SelectionModel<PeriodicElement>(true, []);
          console.log("2", this.selection.selected);
        }

        let count_approve_your = response.your.filter(x => x.last_status=="Approved").length
        let count_approve_other = response.other.filter(x => x.last_status=="Approved").length
        
        let count_your = response.your.length

        if (count_your+count_approve_other>this.course.capacity) { 
          this.disabled_chkall = true; 
        } 
        else { 
          this.disabled_chkall = false; 
        }

        // console.log('1: ',this.data_grid.filter(x => x.center_approved_checked == true).length);
        // console.log('2: ',this.data_grid_other.filter(x => x.center_approved_checked == true).length);
        this._checkbox = this.data_grid.filter(x => x.final_approved_checked == true).length + this.data_grid_other.filter(x => x.final_approved_checked == true).length;
        // console.log('3: ',this._checkbox);

        console.log(this.dtElement);
        console.log(this.dtElementOther);

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
          // this.isDtInitializedOther = true
          this.dtTriggerOther.next();
        }
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
        this.data_grid_other = [];
      });
  }

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
  position_code: string;
  position_name_en: string;
  remark: string;
  seq_no: number;
  title_name_en: string;
}