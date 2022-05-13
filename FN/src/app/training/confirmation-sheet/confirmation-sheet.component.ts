import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { AppServiceService } from 'src/app/app-service.service';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-confirmation-sheet',
  templateUrl: './confirmation-sheet.component.html',
  styleUrls: ['./confirmation-sheet.component.scss']
})
export class ConfirmationSheetComponent implements OnInit {
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
  response: any;
  email: any;

  constructor(private service: AppServiceService) {

   }

  ngOnInit(): void {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this.get_courses();
  }

  async get_courses(){
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
  }

  async get_course() {
    let self = this
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
        self.get_email()
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

  async get_email(){
    this.email = await this.service.axios_get(`Courses/ConfirmationSheet/${this.course_no}`);    
    var text_to = "";
    this.email.registrant.forEach(element => {
      text_to += element.email+"; "
    });
    var text_cc = "";
    this.email.approver.forEach(element => {
      text_cc += element.employee.email+"; "
    });
    this.email.trainer.forEach(element => {
      text_cc += element.email+"; "
    });
    this.email.to = text_to
    this.email.cc = text_cc
    this.email.content = `Confirm Training : ${this.course.course_name_th}: ${formatDate(this.course.date_start,'MMMM dd,yyyy','en-US')}  ~  ${formatDate(this.course.date_end,'MMMM dd,yyyy','en-US')}<br><br> 
    To Whom It May Concern,<br> <br> 
    
    I would like to confirm about the lists :<br> 
    ****************************************************************************************<br> <br> 

    Course: ${this.course.course_name_th} <br>
    Date: ${formatDate(this.course.date_start,'MMMM dd,yyyy','en-US')}  ~  ${formatDate(this.course.date_end,'MMMM dd,yyyy','en-US')}<br> 
    Time: ${formatDate(this.course.date_start,'HH:mm','en-US')} ~ ${formatDate(this.course.date_end,'HH:mm','en-US')} 
    (Please arrive 10 minutes early to allow us enough time to check your list.) <br>
    Place: ${this.course.place} <br>
    Trainer: ${this.course.trainer_text} <br>
    Please try to be punctual, so we can start the training on time. <br>
    Prepare : Eraser, Pencil <br>
    Please click the link. <a href="http://cptsvs52t/HRGIS_TEST">http://cptsvs52t/HRGIS_TEST</a> to see more detail`
    console.log(this.email);
  }

  async copy_to_clipboard(content){
    var text = ""
    if(content=="to"){
      text = this.email.to
    }
    else if(content=="cc"){
      text = this.email.cc
    }
    else if(content=="content"){
      text = this.email.content.replace(/<[^>]*>/g, '')
    }
    else{
      text = ""
    }
    if(text==""){
      alert("Text is empty. Nothing to copy.")
    }
    else{
      document.addEventListener('copy', (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', (text));
        e.preventDefault();
        document.removeEventListener('copy', null);
      });
      document.execCommand('copy');
      alert("Copied text: "+text)
    }
  }
}