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

  constructor() { }

  ngOnInit(): void {
    this.link = `${environment.API_URL}CourseMasters/Course_Assessment_File/${this.course_no}`
  }

  async download(){
    let self = this
    this.link = `${environment.API_URL}CourseMasters/Course_Assessment_File/${this.course_no}`
    if(self.course_no.trim()!=""){
      if(this.course_no.length>=10)
      {
        this.error = ""
        await axios.get(`${this.link}`)
          .then(function (response) {
          location.href=self.link 
        }) 
        .catch(function (error) {
          console.log(error)
          Swal.fire({
            icon: 'error',
            title: error.response.status,
            text: error.response.data
          })
        }) 
      }
      else
      {
        this.error = "Min 11 characters"
      }     
    }
    else
    {
      this.error = "Please fill course no."
    }

  }  


}
