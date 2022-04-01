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
  course_no: string;
  error: string = "";
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  courses: any = [];
  course: any = {};
  download_button_disabled: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.get_courses();
  }

  async get_courses(){
    let self = this
    axios.get(`${environment.API_URL}Courses`,self.headers)
    .then(function(response){
      self.courses = response
    })
    .catch(function(error){
    });
  }

  async get_course(){
    let self = this
    if(this.course_no!=null){
      axios.get(`${environment.API_URL}Course/${this.course_no}`,self.headers)
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
  }

  custom_search_course_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
  }
  
  async clear_data() {
    this.course = {};
    this.download_button_disabled = true;
  }
  async download(){
    location.href = `${environment.API_URL}CourseMasters/Course_Assessment_File/${this.course_no}`
  }  


}
