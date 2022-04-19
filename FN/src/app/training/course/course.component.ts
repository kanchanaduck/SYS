import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbDate, NgbDateStruct, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';
import axios from 'axios';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
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
  _org_abb: string = "";
  _org_code: string = "";
  @ViewChild("txtgroup") txtgroup;
  @ViewChild("txtdate_from") txtdate_from;
  @ViewChild("txtdate_to") txtdate_to;
  form: FormGroup;
  submitted = false;
  isreadonly = false;
  visableSave = true;
  visableUpdate = false;
  visableClear = true;
  open_regis: boolean = false;
  chk_disable: boolean = false;
  isdisabled: boolean = true;
  value_trainer: any;
  selected_trainer_multiple: any = [];
  course: any = {};
  errors: any;
  master_course_no: string;

  headers: any = {
    headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  is_committee: boolean;
  courses: any;

  constructor(private modalService: NgbModal, config: NgbModalConfig, public activeModal: NgbActiveModal, private formBuilder: FormBuilder, private service: AppServiceService) {
    // popup
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
      this.form = this.formBuilder.group(
        {
          frm_course: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(20)]],
          frm_course_th: ['', [Validators.required]],
          frm_course_en: [''],
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
    this.check_is_committee()
    this.fnGet()
    this.fnGetband();
    this.course.time_in_hh = "8"
    this.course.time_in_mm = "30"
    this.course.time_out_hh = "16"
    this.course.time_out_mm = "30"
  }

  async get_courses(){
    let self = this
    await axios.get(`${environment.API_URL}CourseMasters/Org/${this._org_code}`, this.headers)
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
            ]
          }
        ],
      },
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
      order: [[0, 'desc']],
      autoWidth: false,
      columnDefs: [
        {
          targets: [9, 10],
          orderable: false,
        },
        {
          targets: [10],
          visible: this.is_committee
        }
      ],
    };
  }

  async fnSave() {
    this.submitted = true;

    let self = this
    let courses_trainers = []
    let courses_bands = []

    if( this.selected_trainer_multiple.length > 0 ){
      this.selected_trainer_multiple.forEach(element => {
        let trainer = {
          course_no:  self.course.course_no,
          trainer_no: element
        }
        courses_trainers.push(trainer)
      });
    }

    if( this.checkedIDs.length > 0 ){
      this.checkedIDs.forEach(element => {
        let band = {
          course_no: self.course.course_no,
          band: element.band
        }
        courses_bands.push(band)
      });
    }

    let form_data = {
      course_no: this.course.course_no,
      master_course_no: this.course.master_course_no,
      course_name_th: this.course.course_name_th,
      course_name_en: this.course.course_name_en,
      org_code: this._org_code,
      days: this.course.days,
      capacity: this.course.capacity,
      open_register: this.course.open_register,
      courses_bands: courses_bands,
      date_start: this.course.date_start===undefined? "":`${this.convert_ngbdate(this.course.date_start)} ${(this.course.time_in_hh).padStart(2,"0")}:${(this.course.time_in_mm).padStart(2,"0")}:00`,
      date_end: this.course.date_end===undefined? "":`${this.convert_ngbdate(this.course.date_end)} ${(this.course.time_out_hh).padStart(2,"0")}:${(this.course.time_out_mm).padStart(2,"0")}:00`,
      place: this.course.place,
      courses_trainers: courses_trainers
    }  
      
      console.log(form_data)

      self.errors = {};
      await axios.post(`${environment.API_URL}Courses`, form_data , this.headers)
      .then(function (response) {
        self.fnClear()
        self.fnGet();
      })
      .catch(function (error) {
        self.errors = error.response.data.errors
        console.log(error.response)
        Swal.fire({
          icon: 'error',
          title: error.response.status,
          text: typeof error.response.data === 'object'? error.response.data.title:error.response.data
        })
      });
  }

  convert_ngbdate(date: any){
    console.log(date)
    return `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`
  }

  fnClear() {

    this.errors = {};
    this.course = {};
    this.visableSave = true;
    this.visableUpdate = false;

    this.checkboxesDataList.forEach((value, index) => {
      value.isChecked = false;
    });
    this.checkedIDs = [];
    this.selected_trainer_multiple = [];

    this.course.time_in_hh = "8"
    this.course.time_in_mm = "30"
    this.course.time_out_hh = "16"
    this.course.time_out_mm = "30"
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
  async fnEdit(course_no) {
    this.visableSave = false;
    this.visableUpdate = true;

    this.course = {};
    this.errors = {};
    this.course = {};

    let self = this
    await axios.get(`${environment.API_URL}Courses/${course_no}`, this.headers)
    .then(function(response){
      self.course = response
      

      self.course.time_in_hh = (new Date(self.course.date_start).getHours()).toString();
      self.course.time_in_mm = (new Date(self.course.date_start).getMinutes()).toString();
      self.course.time_out_hh = ( new Date(self.course.date_end).getHours()).toString();
      self.course.time_out_mm = (new Date(self.course.date_end).getMinutes()).toString();


      self.course.date_start = new NgbDate(new Date(self.course.date_start).getFullYear(), 
                                            new Date(self.course.date_start).getMonth()+1, 
                                            new Date(self.course.date_start).getDate()); 

      self.course.date_end = new NgbDate(new Date(self.course.date_end).getFullYear(), 
                                            new Date(self.course.date_end).getMonth()+1, 
                                            new Date(self.course.date_end).getDate()); 
                                            

      self.array_chk.forEach(object => {
        object.isChecked = false; 
      }); 
      for (const iterator of self.course.courses_bands) {
        console.log(iterator)
        self.array_chk.find(v => v.band === iterator.band).isChecked = true;
      }
      self.checkboxesDataList = self.array_chk;

      self.fetchCheckedIDs();

      self.selected_trainer_multiple = [];
      console.log('self.course.trainer: ',self.course.courses_trainers);

      self.course.courses_trainers.forEach(element => {
        self.selected_trainer_multiple.push(element.trainer_no)
      });

      console.log(self.course)
    })
    .catch(function(error){

    });



  }

  async fnUpdate() {
    let self = this
    this.submitted = true;


    let courses_trainers = []
    let courses_bands = []

    if( this.selected_trainer_multiple.length > 0 ){
      this.selected_trainer_multiple.forEach(element => {
        let trainer = {
          course_no:  self.course.course_no,
          trainer_no: element
        }
        courses_trainers.push(trainer)
      });
    }

    if( this.checkedIDs.length > 0 ){
      this.checkedIDs.forEach(element => {
        let band = {
          course_no: self.course.course_no,
          band: element.band
        }
        courses_bands.push(band)
      });
    }

    const send_data = {
      course_no: this.course.course_no,
      master_course_no: this.course.master_course_no,
      course_name_th: this.course.course_name_th,
      course_name_en: this.course.course_name_en,
      org_code: this._org_code,
      days: this.course.days,
      capacity: this.course.capacity,
      open_register: this.course.open_register,
      courses_bands: courses_bands,
      date_start: this.course.date_start===undefined? "":`${this.convert_ngbdate(this.course.date_start)} ${(this.course.time_in_hh).padStart(2,"0")}:${(this.course.time_in_mm).padStart(2,"0")}:00`,
      date_end: this.course.date_end===undefined? "":`${this.convert_ngbdate(this.course.date_end)} ${(this.course.time_out_hh).padStart(2,"0")}:${(this.course.time_out_mm).padStart(2,"0")}:00`,
      place: this.course.place,
      courses_trainers: courses_trainers
    }
    console.log('send data: ', send_data);

    await this.service.axios_put(`Courses/${this.course.course_no}`, send_data, 'Update data success.');
    this.fnClear()
    this.fnGet();
  }
  async fnDelete(course_no) {
    console.log(course_no)
    Swal.fire({
      icon: 'warning',
      title: 'Do you sure to delete this record?',
      text: 'Please confirm by enter Course no: ' + course_no + '. and press confirm Course no.',
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
        if (course_no === result.value) {
          await this.service.axios_delete('Courses/' + result.value, 'Delete data success.');
          this.fnGet();
          this.fnClear();
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Course no. do not match.'
          })
        }
      }
    })
  }

  open(content) {
    const modalRef = this.modalService.open(content, { size: 'xl' });
    modalRef.result.then(
      (result) => {
        console.log(result);
      },
      (reason) => {
        console.log(reason);
      }
    );
  } 

  // // Open popup Course
  // inputitem = 'course-open';
  // openCourse(content) {
  //   //   size: 'lg' //sm, mb, lg, xl
  //   this.v_course_no = "";
  //   const modalRef = this.modalService.open(content, { size: 'lg' });
  //   modalRef.result.then(
  //     (result) => {
  //       console.log(result);
  //       if (result != "OK") {
  //         this.fnGetCourse("NULL");
  //         this.v_course_no = "";
  //       }
  //     },
  //     (reason) => {
  //       console.log(reason);
  //       this.fnGetCourse("NULL");
  //       this.v_course_no = "";
  //     }
  //   );
  // } 


  // v_course_no: string = "";
  // addItemCourse(newItem: string) {
  //   this.visableSave = true;
  //   this.visableUpdate = false;
  //   this.v_course_no = newItem;
  //   this.errors = {};
  //   this.fnGetCourse(newItem);
  // }

  response: any = [];


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
    let course_no = this.course.course_no
    this.checkboxesDataList.forEach((value, index) => {
      if (value.isChecked) {
        let band = {
          course_no: course_no,
          band: value.band
        }
        this.checkedIDs.push(band);
      }
    });
    console.log('checkedIDs: ', this.checkedIDs);
  }
  // End Multiple Checkbox



  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.get_courses()
        self.fnGetTrainer();
        this.datatable()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
        this.datatable()
      }); 
  }

  async fnGetCourse() {
    this.errors = {};
    this.response = await this.service.axios_get(`CourseMasters/SearchCourse/${this.course.master_course_no}/${this._org_code}`);
    console.log('fnGetCourse: ', this.response);
    if (this.response != undefined) {

      this.course = this.response;
      this.course.master_course_no = this.course.course_no;
      this.course.time_in_hh = "8"
      this.course.time_in_mm = "30"
      this.course.time_out_hh = "16"
      this.course.time_out_mm = "30"

      var nameArr = this.response.master_courses_bands;
      this.array_chk.forEach(object => {
        object.isChecked = false;
      }); 
      for (const iterator of nameArr) {
        this.array_chk.find(v => v.band === iterator.band).isChecked = true;
      } 
      this.checkboxesDataList = this.array_chk;
      this.fetchCheckedIDs();      

      this.isdisabled = false;
    } 
    else {

      this.checkboxesDataList.forEach((value, index) => {
        value.isChecked = false;
      });
      this.isdisabled = true;
    }
  }

  async fnGet() {
    await this.service.gethttp('Courses')
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
      });
  }

  async fnGetTrainer() {
    // this.value_trainer = await this.service.axios_get('Trainers/FullTrainers'); // console.log('fnGetTrainer: ', this.value_trainer);
    this.value_trainer = await this.service.axios_get(`Trainers/Owner/${this._org_code}`)
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
  console.log(date)
  
  console.log(d)

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}
