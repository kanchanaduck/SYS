import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import axios from 'axios';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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
  @ViewChild(DataTableDirective) 
  dtElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  isDtInitialized: boolean = false

  @ViewChild(DataTableDirective) 
  dtElementOther: DataTableDirective;
  dtOptionsOther: any = {};
  dtTriggerOther: Subject<any> = new Subject();
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
  isreadonly: boolean = true;
  txt_not_pass = "";
  emp_no: string = "";
  emp_name: string = "";
  emp_status: string = "";
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  _org_code: string = "";

  // form: FormGroup;
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
  arr_band: any;

  constructor(
    private modalService: NgbModal, 
    config: NgbModalConfig, 
    private service: AppServiceService, 
    private exportexcel: ExportService,
    private httpClient: HttpClient) 
  {
    config.backdrop = 'static'; // popup
    config.keyboard = false;
  }

  ngOnInit() {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no

    this.check_is_committee()
    this.get_courses_open()
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
          }, {
            text: '<i class="fas fa-envelope"></i> Send e-mail</button>',
            key: '1',
            action: () => {
              this.fnSendMail();
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
          targets: [10],
          orderable: false
        },
        {
          targets: [10],
          visible: this.is_committee
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
      container: "#example2_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10
    }; 
  }

  async get_course() {
    let self = this
    self.errors = {}

    if(this.course_no==null)
    {
      return;
    }
    else
    {
      self.data_grid = [];
      self.data_grid_other = [];
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
          self.get_registrant()
        })
        .catch(function(error){
          self.service.sweetalert_error(error)
          self.clear_data()
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
    this.data_grid_other = [];
  }

  async fnSave() {
    this.submitted = true;

    const send_data = {
      course_no: this.course_no,
      emp_no: this.emp_no,
      last_status: (this.data_grid.length + this.data_grid_other.length) + 1 > this.course.capacity ? environment.text.wait : null,
      remark: this.txt_not_pass
    }

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
      self.get_registrant();
      self.fnClear()
    })
    .catch(function(error){
      self.errors = error.response.data.errors
      self.service.sweetalert_error(error)
    })
  }
  res_mail: any;
  async fnSendMail() {
    if (this.course_no != "") {
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

  async fnClear() {
    this.errors = {}
    this.emp_no = "";
    this.emp_name = "";
    this.txtdept.nativeElement.value = "";
    this.txtposition.nativeElement.value = "";
    this.txtband.nativeElement.value = "";
    this.txt_not_pass = "";
  }

  async fnDelete(item) {
    // console.log('fn_delete', item);
    let self = this
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to delete this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.value) {
        axios.delete(`${environment.API_URL}Registration/${item.course_no}/${item.emp_no}`, this.headers)
        .then(function(response){
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: environment.text.delete,
            showConfirmButton: false,
            timer: 2000
          })
          self.get_registrant();
        })
        .catch(function(){
          
        })
      }
    })
  }

  res_course: any = [];

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
    this.res_prev = await this.service.axios_get(`Registration/GetPrevCourse/${this.course_no}/${empno}`); // console.log('searchPrevCourse: ', this.res_prev);
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

    if(this.file===undefined){
      console.log(this.file)
      this.errors =  {
        file: ["Please select file to upload"]
      };
      return;
    }

    let formData = new FormData();
    if (this.customFile.nativeElement.value !== undefined && 
          this.customFile.nativeElement.value !== "" && 
          this.customFile.nativeElement.value !== null) {
      formData.append('file_form', this.file)
      formData.append('file_name', this.fileName)
      formData.append('dept_abb', this._org_abb)
      formData.append('capacity', this.course.capacity)

      this.result = await this.service.axios_formdata_post('/Registration/UploadCourseRegistration/' + this.course_no, formData, environment.text.success);
      this.errors = {};
      // console.log('result: ', this.result.data);
      if (this.result.data.length > 0) {
        Swal.fire({
          icon: 'warning',
          text: "There is something error, please see the files."
        })
        let element = this.result.data;
        this.exportexcel.exportJSONToExcel(element, 'ResultRegistration');
      }

      this.customFile.nativeElement.value = ""; // console.log(this.file); // console.log(this.fileName);
      this.nameFile = 'Choose file';
      this.get_registrant();
    }
  }
  /** End File Upload, Download */

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

  async get_registrant() {
    await this.httpClient.get(
      `${environment.API_URL}Registration/GetGridView/${this.course_no}/${this._org_code}`,
      this.headers
      )
      .subscribe((response: any) => {
        this.data_grid = response.your;
        this.data_grid_other = response.other;

        console.log(this.dtElement);
        console.log(this.dtElementOther);

        // if (this.isDtInitialized) {
        //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        //     dtInstance.clear().draw();
        //     dtInstance.destroy();
        //     this.dtTrigger.next();
        //   });
        // } 
        // else {
        //   this.isDtInitialized = true
        //   this.dtTrigger.next();
        // }
        
        // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        //   dtInstance.destroy();
        //   this.dtTrigger.next();
        // });

        // this.dtElementOther.dtInstance.then((dtInstance: DataTables.Api) => {
        //   dtInstance.destroy();
        //   this.dtTriggerOther.next();
        // });
        
        // if (this.isDtInitialized) {
        //   alert(1)
        //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        //     // dtInstance.clear().draw();
        //     dtInstance.destroy();
        //     this.dtTrigger.next();
        //   });
        // } 
        // else {
        //   alert(2)
        //   this.isDtInitialized = true
        //   this.dtTrigger.next();
        // }
        // if (this.isDtInitializedOther) {
        //   this.dtElementOther.dtInstance.then((dtInstance: DataTables.Api) => {
        //     dtInstance.clear().draw();
        //     dtInstance.destroy();
        //     this.dtTriggerOther.next();
        //   });
        // } 
        // else {
        //   this.isDtInitializedOther = true
        //   this.dtTriggerOther.next();
        // }
      }, (error: any) => {
        console.log(error);
        this.data_grid = [];
        this.data_grid_other = [];
      });
  } 

  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  //   this.dtTriggerOther.next();
  // }

  // ngOnDestroy(): void {
  //   this.dtTrigger.unsubscribe();
  //   this.dtTriggerOther.unsubscribe();
  // }
}
