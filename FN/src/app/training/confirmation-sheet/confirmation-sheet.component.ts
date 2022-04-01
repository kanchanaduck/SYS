import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { NgbModal, NgbModalConfig, NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-sheet',
  templateUrl: './confirmation-sheet.component.html',
  styleUrls: ['./confirmation-sheet.component.scss']
})
export class ConfirmationSheetComponent implements OnInit {
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable
  @ViewChild("txtcourse_no") txtcourse_no;
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  _org_code: string = "";
  isCheck: boolean = false;
  loading: boolean = false;

  course_no: string;
  course: any = {};
  courses: any = [];
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }

  constructor(private modalService: NgbModal, config: NgbModalConfig, processbar: NgbProgressbarConfig, private service: AppServiceService) {
    config.backdrop = 'static'; // popup
    config.keyboard = false;

    processbar.max = 1000;  // processbar
    processbar.striped = true;
    processbar.animated = true;
    processbar.type = 'primary';
   }

  ngOnInit(): void {
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
              }
            ]
          }, {
            text: '<i class="fas fa-envelope"></i> Trainee email</button>',
            key: '1',
            action: () => {
              if(this.course_org_code != ""){
                this.fnSendMail();
              }
            }
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      // order: [[1, 'desc']],
    };

    // this.fnGet("NULL");
    // this.fnGetCenter(this._emp_no);
    this.fnGetStakeholder(this._emp_no)
    this.get_courses()
  }

  async get_courses(){
    let self = this
    await axios.get(`${environment.API_URL}Courses`, this.headers)
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
  }


 /*  async onKeyCourse(event: any) {
    if (event.target.value.length >= 11 && event.target.value.length < 12) {
      this.fnGet(event.target.value);
    } else if (event.target.value.length == 0) {
      this.fnGet("NULL");
    }
  } */

  // async fnGetCenter(emp_no: any) {
  //   await this.service.gethttp('Center/' + emp_no)
  //     .subscribe((response: any) => {
  //       console.log(response);
  //       this.isCenter = true;
  //     }, (error: any) => {
  //       console.log(error);
  //       this.fnGet("No");
  //       this.isCenter = false;
  //     });
  // }

  org_code: any;
  async fnGetStakeholder(emp_no: any) {
    await this.service.gethttp('Stakeholder/Employee/' + emp_no)
      .subscribe((response: any) => {
        if (response.role.toUpperCase() == environment.role.committee) {
          console.log(response);
          this.org_code = response.org_code;     
          this.isCheck = true;
        }
      }, (error: any) => {
        console.log(error);
        // this.fnGet("No");
        this.isCheck = false;
      });
  }

  // Open popup Course
  inputitem = 'course-confirmation-sheet';
  /* openCourse(content) {
    //   size: 'lg' //sm, mb, lg, xl
    this.v_course_no = "";
    const modalRef = this.modalService.open(content, { size: 'lg' });
    modalRef.result.then(
      (result) => {
        console.log(result);
        if (result != "OK") {
          this.txtcourse_no.nativeElement.value = "";
          this.fnGet("NULL");
          this.v_course_no = "";
        }else{
          this.fnGet(this.txtcourse_no.nativeElement.value);
        }
      },
      (reason) => {
        console.log(reason);
        this.txtcourse_no.nativeElement.value = "";
        this.fnGet("NULL");
        this.v_course_no = "";
      }
    );
  } */

  v_course_no: string = "";
  addItemCourse(newItem: string) {
    this.v_course_no = newItem;
    this.txtcourse_no.nativeElement.value = newItem;
  }
  // End Open popup Course

  mail_date: any; mail_time: any; mail_place: any; mail_course: any; course_org_code: string = "";
  async get_course() {

    await this.service.gethttp('OtherData/GetGETREGISTRATION?course_no=' + this.course_no)
      .subscribe((response: any) => {
        console.log(response);
        if (response.length > 0) {
          this.mail_date = new Date(response[0].date_start).getDate() + "-" + new Date(response[0].date_end).getDate() + " " + new Date(response[0].date_start).toLocaleString('default', { month: 'long' }) + " " + new Date(response[0].date_start).getFullYear();
          this.mail_time = response[0].time_in + "～" + response[0].time_out;
          this.mail_place = response[0].place;
          this.mail_course = response[0].course_no + "(" + response[0].course_name_th + ")";
          this.course_org_code = response[0].org_code;
        }

        this.data_grid = response;

        // Calling the DT trigger to manually render the table
        if (this.isDtInitialized) {
          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.clear().draw();
            this.isDtInitialized = true
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

  res_mail: any;
  res_file: any;
  array_to: any = [];
  async fnSendMail_old() {
    if(this.org_code != this.course_org_code){ 
      Swal.fire({
        icon: 'error',
        text: environment.text.invalid_course
      })
      return; 
    }

    if (this.isCheck == true) {
      if (this.course_no != "" && this.mail_date != undefined) {
        this.loading = true;

        this.res_mail = await this.service.axios_get('OtherData/GetSendMailConfirmation?course_no=' + this.course_no);
        console.log(this.res_mail);
        Array.prototype.push.apply(this.array_to, this.res_mail.trainee);
        Array.prototype.push.apply(this.array_to, this.res_mail.trainner);
        Array.prototype.push.apply(this.array_to, this.res_mail.manager);
        Array.prototype.push.apply(this.array_to, this.res_mail.center);
        Array.prototype.push.apply(this.array_to, this.res_mail.approver);

        this.array_to = removeDuplicateObjectFromArray(this.array_to, 'emp_no'); // console.log('remove: ', this.array_to);
        this.array_to = this.array_to.filter(x => x.email != null && x.email != '');
        if (this.array_to.length > 0) {
          const filter_form = this.array_to.filter(e => e.emp_no == this._emp_no);  console.log(filter_form);
          const filter_to = this.array_to; console.log(filter_to); // console.log(filter_to.map(a => a.email).join());

          Swal.fire({
            title: 'Are you sure? \n you want to send e-mail to',
            text: filter_to.map(a => a.email).join("; "),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then(async (result) => {
            if (result.value) {

              // this.res_file = await this.service.axios_get('OtherData/ConfirmationExcel?course_no=' + this.txtcourse_no.nativeElement.value);
              // console.log(this.res_file);

              var formData_M = new FormData();
              let mailform = filter_form[0].email;
              let subject = "Confirm Training : " + this.mail_course + " : " + this.mail_date;
              formData_M.append('from', mailform);

              let select_data = filter_to.map(a => a.emp_no);
              let emp_to = filter_to.filter(function (item) {
                return select_data.includes(item.emp_no)
              }); //console.log(emp_to);
              for (var i = 0; i < emp_to.length; i++) {
                if (emp_to[i].email != null) {
                  formData_M.append('to', emp_to[i].email); // console.log(emp_to[i].email);
                }
              }

              let dear = filter_to.map(a => a.fullname).join(", "); // console.log(dear);
              formData_M.append('subject', "[TEST][HRGIS TRAINING] " + subject);
              formData_M.append('text', "Dear: " + dear + " \n\n" +
                "I would like to confirm about the lists :\n" +
                "****************************************************************************************\n" +
                "Course          :   \"" + this.mail_course + "\"\n" +
                "Date            :   " + this.mail_date + "\n" +
                "Time            :   " + this.mail_time + " (Please arrive 10 minutes early to allow us enough time to check your list.)\n" +
                "Place           :   " + this.mail_place + "\n" +
                "Trainer         :   " + this.res_mail.trainner.map(a => a.fullname).join(", ") + "	\n" +
                "Please try to be punctual, so we can start the training on time.\n" +
                "****************************************************************************************\n" +
                "Prepare     : Eraser\n" +
                "            : Pencil\n" +                
                "Please click the link. http://cptsvs52t/HRGIS_TEST \n\n" +
                "Best Regards");
              var url = "http://cptsvs531:1000/middleware/email/sendmail";
              // this.service.axios_formdata_post(url, formData_M, 'Send mail success.');

              // for (var pair of formData_M.entries()) {
              //   console.log(pair[0] + ', ' + pair[1]);
              // }
            }
          })
        }

        this.loading = false;
      }
      else{
        Swal.fire({
          icon: 'error',
          text: environment.text.not_sendmail
        })
      }
    }
    else{
      Swal.fire({
        icon: 'error',
        text: environment.text.committee_only
      })
    }
  }

  async fnSendMail() {
    if(this.org_code != this.course_org_code){ 
      Swal.fire({
        icon: 'error',
        text: environment.text.invalid_course
      })
      return; 
    }

    if (this.isCheck == true) {
      if (this.course_no != "" && this.mail_date != undefined) {
        this.loading = true;

        this.res_mail = await this.service.axios_get('OtherData/GetSendMailConfirmation?course_no=' + this.course_no);
        console.log(this.res_mail);
        Array.prototype.push.apply(this.array_to, this.res_mail.trainee);
        Array.prototype.push.apply(this.array_to, this.res_mail.trainner);
        Array.prototype.push.apply(this.array_to, this.res_mail.manager);
        Array.prototype.push.apply(this.array_to, this.res_mail.center);
        Array.prototype.push.apply(this.array_to, this.res_mail.approver);

        this.array_to = removeDuplicateObjectFromArray(this.array_to, 'emp_no'); // console.log('remove: ', this.array_to);
        this.array_to = this.array_to.filter(x => x.email != null && x.email != '');
        if (this.array_to.length > 0) {
          const filter_form = this.array_to.filter(e => e.emp_no == this._emp_no);  console.log(filter_form);
          const filter_to = this.array_to; console.log(filter_to); // console.log(filter_to.map(a => a.email).join());

          Swal.fire({
            // title: 'Are you sure? \n you want to send e-mail to',
            title: 'List e-mail to',
            text: filter_to.map(a => a.email).join("; "),
            // icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then(async (result) => {
            if (result.value) {
              let mailform = filter_form[0].email;
              let subject = "Confirm Training : " + this.mail_course + " : " + this.mail_date;
              let dear = filter_to.map(a => a.fullname).join(", "); // console.log(dear); 
                           
              var mailOptions = {
                from: mailform,
                to: filter_to.map(a => a.email).join("; "),
                subject: "[TEST][HRGIS TRAINING] " + subject,
                text: "Dear: " + dear + " \n\n" +
                "I would like to confirm about the lists :\n" +
                "****************************************************************************************\n" +
                "Course          :   \"" + this.mail_course + "\"\n" +
                "Date            :   " + this.mail_date + "\n" +
                "Time            :   " + this.mail_time + " (Please arrive 10 minutes early to allow us enough time to check your list.)\n" +
                "Place           :   " + this.mail_place + "\n" +
                "Trainer         :   " + this.res_mail.trainner.map(a => a.fullname).join(", ") + "	\n" +
                "Please try to be punctual, so we can start the training on time.\n" +
                "****************************************************************************************\n" +
                "Prepare     : Eraser\n" +
                "            : Pencil\n" +                
                "Please click the link. http://cptsvs52t/HRGIS_TEST \n\n" +
                "Best Regards"
              };
              console.log('mailOptions: ',mailOptions);
              
              // location.href = "mailto:nuttaya001@gmail.com?" + mailOptions;
            }
          })
        }

        this.loading = false;
      }
      else{
        Swal.fire({
          icon: 'error',
          text: environment.text.not_sendmail
        })
      }
    }
    else{
      Swal.fire({
        icon: 'error',
        text: environment.text.committee_only
      })
    }
  }  

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  nameFile: string = 'Attached file';
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

  // Exemple
  async fnSendMailExemple(course_no) {
    var formData_M = new FormData();
    let mailform = 'nuttaya001@mail.canon';
    let subject = "Request for approval to participate in the training.";
    formData_M.append('from', mailform);

    let alllst_data = [{ emp_no: "014748", email: "nuttaya001@mail.canon" }, { emp_no: "014749", email: "natirut@mail.canon" }];
    // let select_data = ["014748", "014749"];
    let select_data = ["014748"];
    let emp_to = alllst_data.filter(function (item) {
      return select_data.includes(item.emp_no)
    });
    for (var i = 0; i < emp_to.length; i++) {
      if (emp_to[i].email != null) {
        formData_M.append('to', emp_to[i].email);
      }
    }

    // this.res_file = this.service.axios_get('OtherData/ConfirmationExcel?course_no=' + course_no);
    // let attachments = [
    //   {
    //     filename: 'Confirmation_Sheet_Result.xlsx',
    //     path: `${environment.API_URL}wwwroot/excel/Confirmation_Sheet/Confirmation_Sheet_Result.xlsx`,
    //     cid: 'Confirmation_Sheet_Result.xlsx'
    //   }
    // ]
    console.log(this.file);
    if (this.file != undefined) {
      formData_M.append('attachment', this.file);
    }

    let dear = "MISS.NUTTAYA K(ICD), MR.NATIRUT S(ICD)"
    formData_M.append('subject', "[HRGIS TRAINING] " + subject);
    formData_M.append('text', "Dear: " + dear + " \n\n" +
      "I would like to notify that your members request to participate in the training.\n" +
      "Please click the link to approve. http://cptsvs52t/HRGIS_TEST \n\n" +
      "Best Regards");
    var url = "http://cptsvs531:1000/middleware/email/sendmail";
    // this.service.axios_formdata_post(url, formData_M, 'Send mail success.');

    // for (var pair of formData_M.entries()) {
    //   console.log(pair[0] + ', ' + pair[1]);
    // }
  }
  // end Exemple

}

function removeDuplicateObjectFromArray(array, key) {
  return array.filter((obj, index, self) =>
    index === self.findIndex((el) => (
      el[key] === obj[key]
    ))
  )
}