import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessment-file',
  templateUrl: './assessment-file.component.html',
  styleUrls: ['./assessment-file.component.scss']
})
export class AssessmentFileComponent implements OnInit {

  link: string;
  course_no: string = "";
  error: string = "";
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  course: any = {};
  download_button_disabled: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.link = `${environment.API_URL}CourseMasters/Course_Assessment_File/${this.course_no}`
  }

  async get_course(){
    let self = this
    let course_no = self.course_no.trim()
    if(this.course_no.length>=11){
      axios.get(`${environment.API_URL}CourseOpen/${course_no}`,self.headers)
      .then(function(response){
        self.course = response
        self.download_button_disabled = false;
      })
      .catch(function(error){
        Swal.fire({
          icon: 'error',
          title: error.response.status,
          text: error.response.data
        })
        self.download_button_disabled = true;
        self.course = {};
      });
    }
    else{
      Swal.fire({
        icon: 'error',
        title: '400',
        text: 'Please fill correct course no.'
      })
      self.download_button_disabled = true;
      self.course = {};
    }
  }

  async download(){
    location.href = `${environment.API_URL}CourseMasters/Course_Assessment_File/${this.course_no}`
  }  


}
