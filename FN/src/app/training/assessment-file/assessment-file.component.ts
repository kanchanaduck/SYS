import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { AppServiceService } from 'src/app/app-service.service';
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
  response: any;
  arr_band: any;

  constructor(private service: AppServiceService) { }

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
      axios.get(`${environment.API_URL}Courses/Trainers/?course_no=${self.course_no}`,self.headers)
        .then(function(response: any){
          self.course = response.courses
          self.arr_band = response.courses.courses_bands
          let trainers = response.trainers
          if(self.course.trainer_text!=""){
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
          self.download_button_disabled = false;
        })
        .catch(function(error){
          self.service.sweetalert_error(error)
          self.download_button_disabled = true;
          self.course = {};
          return false;
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
