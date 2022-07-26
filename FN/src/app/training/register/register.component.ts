import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewChildren } from '@angular/core';
import Swal from 'sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import axios from 'axios';
import 'rxjs/add/operator/map';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit, OnDestroy, OnInit{

  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }

  data_grid: any = [];
  data_grid_other: any = [];

  @ViewChildren(DataTableDirective)
  dtElements: any;
  dtTrigger: any = [];
  dtOptions: any = [];
  
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
  _email: string = "";

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
  has_continuous:  boolean = false;

  constructor(private service: AppServiceService, private exportexcel: ExportService) {
  }

  ngOnInit() {

    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this._email = this._getjwt.user.email; // set email

    this.check_is_committee()

    this.get_committee_of_emp_no();
    this.get_courses_open()
    
    this.dtTrigger[0] = new Subject();
    this.dtTrigger[1] = new Subject();

    this.dtOptions[0] = {
      destroy: true,
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        "paginate": {
          "next": '<i class="icon ion-ios-arrow-forward"></i>', // or '→'
          "previous": '<i class="icon ion-ios-arrow-back"></i>' // or '←' 
        },
        aria: {
          paginate: {
              previous: 'Previous',
              next:     'Next'
          }
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
              },
            ]
          },
          {
            text: '<i class="fas fa-envelope"></i> Send email to approver</button>',
            className: 'btn-indigo',
            action: () => {
              this.send_email();
            }
          },
        ],
      },
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      pageLength: 10,
      order: [[0, 'asc']],
      columnDefs: [
        {
          targets: [0, 9],
          orderable: false
        }
      ],
    };

    this.dtOptions[1] = {
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

  async send_email() {
    let self =this
    if(!this.course_no){
      console.log(this.course_no)
      this.errors =  {
        course_no: ["Please select course no."]
      };
      console.log(this.errors.course_no)
      return;
    }
    await axios.get(`${environment.API_URL}Register/GetEmailInformApprover/${this.course_no}/${this._org_code}`, this.headers)
    .then(function(response:any){
      var email_from = self._email;
      var email_to = "";
      var email_dear = "";
      response.forEach(element => {
        email_to += element.employee.email+"; "
        if(element.employee.band=="JP"){
          email_dear += `${element.employee.lastname_en} san,`
        }
        else{
          email_dear += `Khun ${element.employee.firstname_en}, `
        }
      });

      var email_subject = "[HRGIS] Request for approval to participate in the training."

      var email_body = `Dear ${email_dear} <br><br>

I would like to notify that your members request to participate in the training. 
Please click the link to approve. <a href="${environment.WEB_URL}">${environment.WEB_URL}</a>`

      var email_text_show = `<p class="text-left">
      <strong>To:</strong> ${email_to} <br>
      <strong>Subject:</strong>  ${email_subject} <br>
      <strong>Text:</strong> <br> <br>${email_body} </p>
      `
      
      Swal.fire({
        title: '<h4>Are you sure you want send email to inform approver?</h4>',
        width: 600,
        html:  email_text_show,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then(async (result) => {
        if (result.value) {
          let body = {
            "from": email_from,
            "to": email_to,
            "subject": email_subject,
            "text": email_body.replace(/<[^>]*>/g, ''),
          }
          axios.post(`http://cptsvs531:1000/middleware/email/sendmail`, body)
          .then(function(response){
            self.get_registrant();
          })
        }
      })
    })
    .catch(function(error){
      self.service.sweetalert_error(error)
    })
  }

  ngAfterViewInit() {
    this.dtTrigger.forEach(element => {
      element.next();
    });
  }

  ngOnDestroy() {
    this.dtTrigger.forEach(element => {
      element.unsubscribe();
    });
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
        // self.datatable()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
      }); 
  }

  async get_course() {
    let self = this

    if(!this.course_no)
    {
      this.course = {};
      this.data_grid = [];
      this.data_grid_other = [];
      this.get_registrant()
    }
    else
    {
      this.errors = {};
      axios.get(`${environment.API_URL}Courses/Trainers?course_no=${self.course_no}`,self.headers)
        .then(function(response: any){
          self.course = response.courses
          self.arr_band = response.courses.courses_bands;
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
          self.service.sweetalert_error(error)
          self.course = {};
          return false;
      });      
    }
  }

  async get_courses_open(){
    let self = this
    await axios.get(`${environment.API_URL}Courses/Open/StartNotOver5Days`, this.headers)
    .then(function(response){
      self.courses = response
      self.get_course()
    })
    .catch(function(error){

    });
  }

  custom_search_course_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
  }

  async register() {
    this.submitted = true;

    const send_data = {
      course_no: this.course_no,
      emp_no: this.emp_no,
      last_status: (this.data_grid.length + this.data_grid_other.length) + 1 > this.course.capacity ? environment.text.wait : null,
      remark: this.txt_not_pass
    }

    let self = this
    await axios.post(`${environment.API_URL}Register/ByCommitteeEmp`, send_data, this.headers)
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
      self.clear_register_form()
    })
    .catch(function(error){
      self.errors = error.response.data.errors
      self.service.sweetalert_error(error)
    })
  }

  clear_register_form() {
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
        await this.service.axios_delete(`Register/${this.course_no}/${item.emp_no}`, environment.text.delete);
        this.get_registrant();
      }
    })
  }

  res_course: any = [];
  arr_band: any;

  onKeyEmpno(event: any) {
    if (this.emp_no.length >= 6 && this.emp_no.length <= 7) {
      this.searchEmp(this.emp_no);
      this.searchPrevCourse(this.emp_no);
    } 
    else if (this.emp_no.length == 0) {
      this.clear_register_form();
    }
  }

  res_emp: any = [];
  dept_emp: any = ''; 
  div_emp: any = '';
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
    } 
    else {
      this.emp_name= "";
      this.emp_status = "";
      this.txtdept.nativeElement.value = "";
      this.txtposition.nativeElement.value = "";
      this.txtband.nativeElement.value = "";
    }
  }

  res_prev: any;
  async searchPrevCourse(emp_no: any) {    
    this.txt_not_pass=null;
    this.res_prev = await this.service.axios_get('Register/GetPrevCourse/' + this.course_no + '/' + emp_no); // console.log('searchPrevCourse: ', this.res_prev);
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

    let self = this
    
    if(!this.course_no){
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

      await axios.post(`${environment.API_URL}Register/UploadCourseRegister/ByCommitteeEmp/${this.course_no}`
      , formData, this.headers)
      .then(function(response:any){
        if(response.length>0){
          Swal.fire({
            icon: 'warning',
            text: 'There is something error, please see the ResultRegistration.xlsx file.'
          })
          let element = response;
          self.exportexcel.exportJSONToExcel(element, 'ResultRegistration');
          self.customFile.nativeElement.value = ""; 
          self.nameFile = 'Choose file';
        }
        else{
          self.service.sweetalert_create();
        }
        self.get_registrant();
      })
      .catch(function(error){
        self.errors = error.response.data.errors
        // console.log(self.errors)
        self.service.sweetalert_error(error);
        self.customFile.nativeElement.value = ""; 
        self.nameFile = 'Choose file';
      })
    // }

  }
  /** End File Upload, Download */

  async get_registrant() {

    

    if(!this.course_no){
      this.rerender()
    }
    else{
      await this.service.gethttp(`Register/YourOther/${this.course_no}/${this._org_code}`)
        .subscribe((response: any) => {

          if(response.your.length + response.other.length > 0){
            this.has_continuous = response.your.some(function(el){
              return el.remark?.includes("Continuous");
            }) ||
            response.other.some(function(el){
              return el.remark?.includes("Continuous");
            });
          }
          else{
            this.has_continuous = false;
          }
  
          console.log(this.has_continuous)

          this.data_grid = response.your;
          this.data_grid_other = response.other;
          this.rerender()
        }, 
        (error: any) => {
        console.log(error);
      });
    }
  }

  rerender(){
    console.log("DATA", this.data_grid)
    console.log("DATA OTHER", this.data_grid_other)
    this.dtElements.forEach((dtElement: DataTableDirective, index: number) => {
      if(dtElement.dtInstance){
        dtElement.dtInstance.then((dtInstance: any) => {
          dtInstance.destroy();
          // dtInstance.clear().draw();
          console.log(`The DataTable ${index} instance ID is: ${dtInstance.table().node().id}`);
        });
      }
    });
    this.dtTrigger.forEach(element => {
      element.next()
    });
  }

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