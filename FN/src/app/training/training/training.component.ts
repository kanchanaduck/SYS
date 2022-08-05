import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import axios from 'axios';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';
import { Settings } from 'src/app/settings';
@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  training_menu: any = [];
  report_url: string;

  _getjwt: any;
  _emp_no: any;
  _div_code: any;
  _dept_code: any;
  _org_code: any;
  _org_abb: any;
  is_center: boolean = false;


  constructor(private service: AppServiceService) { 

  }
  
  ngOnInit(): void {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no= this._getjwt.user.emp_no; // set emp_no
    this._div_code = this._getjwt.user.div_code; // set dept_code
    this._dept_code = this._getjwt.user.dept_code; // set dept_code
    this.report_url = `${Settings.REPORT_URL}Training/`
    this.check_is_center()
  }

  async check_is_center() {
    let self = this
    await axios.get(`${environment.API_URL}Center/${this._emp_no}`,Settings.headers)
    .then(function (response) {
      self.is_center = true;
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}



