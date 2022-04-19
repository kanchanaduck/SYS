import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { AppServiceService } from '../../app-service.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
@Component({
  selector: 'app-course-master',
  templateUrl: './course-master.component.html',
  styleUrls: ['./course-master.component.scss'],
})
export class CourseMasterComponent implements OnInit {

  dtOptions: any = {};
  all_course: any = [];
  courses: any = [];
  course: any = {};
  bands: any = [];
  errors: any = {};
  master_courses_bands: any = [];
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
  previous_courses: any = [];
  departments: any;
  edit_mode: boolean = false;
  is_center: boolean = false;
  is_committee: boolean = false;
  committees: any = [];
  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;


  constructor(
    private service: AppServiceService, 
    private httpClient: HttpClient
  ) {}

  ngOnInit() {

    

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set dept_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code


    this.get_bands()
    this.get_departments()
    this.check_is_committee()


  
    
  }


  custom_search_org_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.org_code.toLowerCase().indexOf(term) > -1 ||  item.org_abb.toLowerCase().indexOf(term) > -1 ||item.org_abb.toLowerCase() === term;
  }

  custom_search_course_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
  }

  group_by_parent_org_code_fn = (item) => item.parent_org_code;

  group_value_parent_org_code_fn = (_: string, children: any[]) => ({ 
    org_abb: children[0].parent_org.org_abb, 
    disabled: children[0].parent_org.disabled, 
    org_code: children[0].parent_org.org_code });
  
  compare_org = (item, selected) => {
    if (item.org_code && selected) {
      return item.org_code === selected;
    }
    return false;
  };

  isInCourseMaster(band:string){
    return this.courses.some(function(el){
      return el.band === band;
    }); 
  }


  async reset_form_course_master(){
    this.errors = {};
    this.course = {};
    this.previous_courses = [];
    this.get_bands();
    this.edit_mode = false;
  }

  async get_courses(){
    let self = this
    await this.httpClient.get(`${environment.API_URL}CourseMasters`, this.headers)
    .subscribe((response: any) => {
      self.courses = response;
      if(self.is_center){
        self.all_course = self.courses
      }
      else{
        self.get_all_courses()
      }
      if (this.isDtInitialized) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
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

  async get_all_courses(){
    let self = this
    if(!self.is_center){
      await axios.get(`${environment.API_URL}CourseMasters`, this.headers)
      .then(function (response) {
        self.all_course = response
      })
      .catch(function (error) {
        Swal.fire({
          icon: 'error',
          title: error.response.status,
          text: error.response.data
        })
      })
    }
    else{
      self.all_course = self.courses
    }
  }


  async get_course(course_no: number) {
    console.log(course_no)
    this.errors = [];
    let self = this
    self.get_bands()
    self.edit_mode = true;
    self.master_courses_bands = [];

    await axios.get(`${environment.API_URL}CourseMasters/${course_no}`, this.headers)
      .then(function (response) {
        self.course = response
        console.log(response)
        console.log(self.course)

        self.course.course_no_temp = self.course.course_no

        if(self.course.master_courses_bands.length>0){
          self.course.master_courses_bands.forEach(element => {
            element.isChecked= false
          });

          console.log(self.course.master_courses_bands)

          for (const i of self.course.master_courses_bands) {
            self.bands.find(v => v.band === i.band).isChecked = true;
          }          
        }

        let arr1 = [];

        if(self.course.master_courses_previous_courses.length>0 ){
          self.course.master_courses_previous_courses.forEach(i => {
            arr1.push(i.prev_course_no)
          });        
        }
        
        self.previous_courses = arr1;

        console.log(self.previous_courses)

      }) 
      .catch(function (error) {
        Swal.fire({
          icon: 'error',
          title: error.response.status,
          text: error.response.data
        })
    })
  }

  delete_course(course_no: any) {
    let self = this
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
          await this.service.axios_delete(`CourseMasters/${course_no}`, 'Delete data success.');
          self.get_courses();
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Course no. do not match.'
          })
        }
      }
    })
  }
  
  get_bands(){
    let self = this
    axios.get(`${environment.API_URL}Bands`, this.headers).then(response => (
      self.bands = response
    ));

    self.bands.forEach(element => {
      element.isChecked= false
    });
  }

  async get_departments() {
    let self = this
    await axios.get(`${environment.API_URL}Organization/Level/Department/Parent`, this.headers)
    .then(function (response) {
      self.departments = response
      self.departments.forEach(element => {
        element.disabled = true
        element.parent_org.disabled = true
      });
    })
    .catch(function (error) {
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
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
        self.course.org_code = response.org_code
        self.datatable()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
        self.datatable()
      }); 
  }

  datatable(){
    let self = this
    self.get_courses()
      self.dtOptions = {
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
        "search": {
          "search": self.is_committee? self._org_abb:""
        },
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
                  },
              ]
            },
          ],
        },
        order: [ [3, 'asc'], [0, 'asc']],
        rowGroup: {
          dataSrc: [3]
        },
        columnDefs: [ 
          {
            targets: [ 0,8 ],
            "orderable": false
          },
          {
            targets: [ 3 ],
            visible: false 
          },
          {
            targets: [ 8 ],
            visible: self.is_committee? true:false
          }
        ],
  
        container: "#example_wrapper .col-md-6:eq(0)",
        lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      };

  }


  
  save_course_master(){

    let self = this
    self.errors = null;

    self.course.master_courses_bands = self.bands.filter(element => 
      element.isChecked == true
    );

    console.log(self.course.master_courses_bands)

    if(self.course.master_courses_bands!==undefined && self.course.master_courses_bands.length>0){
      self.course.master_courses_bands.forEach(element => {
        element.course_no = self.course.course_no
      });
    }

    console.log(self.course.master_courses_previous_courses)
    console.log(self.previous_courses)

    self.course.master_courses_previous_courses = [];

    if(self.previous_courses!==undefined && self.previous_courses.length>0){
        
      for (const i of self.previous_courses) 
      {
        var arr1 = {
          course_no: self.course.course_no,
          prev_course_no: i
        }
        console.log(i)
        console.log(arr1)
        console.log(self.course.master_courses_previous_courses)
        self.course.master_courses_previous_courses.push(arr1)
      }          
    }

    console.log(self.course.master_courses_previous_courses)



    if(self.edit_mode){
      axios.put(`${environment.API_URL}CourseMasters/${self.course.course_no_temp}`, this.course, this.headers)
      .then(function (response) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: "Success",
          showConfirmButton: false,
          timer: 2000
        })
        self.reset_form_course_master();
        self.get_courses();
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
  else{
    axios.post(`${environment.API_URL}CourseMasters`, this.course, this.headers)
    .then(function (response) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: "Success",
        showConfirmButton: false,
        timer: 2000
      })
      self.reset_form_course_master();
      self.get_courses();
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

  }

}
