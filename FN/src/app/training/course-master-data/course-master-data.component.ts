import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { Settings } from 'src/app/settings';

@Component({
  selector: 'app-course-master-data',
  templateUrl: './course-master-data.component.html',
  styleUrls: ['./course-master-data.component.scss']
})
export class CourseMasterDataComponent implements OnInit {
  courses: any = [];
  course: any = {};
  bands: any = [];
  course_no: string;
  response: any;
  arr_band: any = [];

  constructor(private service: AppServiceService, private route: ActivatedRoute) { 
  }

  ngOnInit(): void {
    this.get_courses()

  }

  async get_courses(){
    let self = this
    await axios.get(`${environment.API_URL}CourseMasters`, Settings.headers)
    .then(function(response){
      self.courses = response    
      self.route.params.subscribe(params => {
      if(params['course_no']){
        self.course_no = params['course_no'];
        self.get_course();
      }
      });
    })
    .catch(function(error){
  
    });
  }

  custom_search_course_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
  }

  async get_course() {
    let self = this

    if(this.course_no==null)
    {
      return false;
    }
    else
    {
      await axios.get(`${environment.API_URL}CourseMasters/${self.course_no}`,Settings.headers)
        .then(function(response: any){
          self.course = response
          self.arr_band = self.course.master_courses_bands

          let bands = self.arr_band
          if(bands.length>0){
            self.course.band_text = bands.map(c => c.band).join(', ');
          }
          else{
            self.course.band_text = "-"
          }
        })
        .catch(function(error){
          self.service.sweetalert_error(error)
          self.course = {};
          return false;
      });      
    }
  }


}
