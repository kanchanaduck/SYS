import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { AppServiceService } from 'src/app/app-service.service';
import { Settings } from 'src/app/settings';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  menus: any = [];
  _data: any;
  _fullname: any;
  _positions: any;
  img_garoon: any = Settings.IMG_GAROON;
  images: any;
  activeUrl: any;
  _emp_no: any;
  password: any = {};
  errors: any = {};


  constructor(
    private service: AppServiceService, 
    private router: Router, 
    private route: ActivatedRoute
  ) { }

  switch1 = false;

  async ngOnInit() {

    if (sessionStorage.getItem('token_hrgis') != null) {
      this._data = await this.service.service_jwt(); 
      this._fullname = this._data.user.fullname_en;
      this._emp_no = this._data.user.emp_no;
      this._positions = this._data.user.position_name_en;
      this.images = `${this.img_garoon}/${this._data.user.emp_no}.jpg`;
    }
  }

  change_password(){
    let self =this
    axios.post(`${environment.API_URL}Account/ChangePassword/${this._emp_no}`, this.password,  Settings.headers)
    .then(function(){
      self.service.sweetalert_edit()  
      self.password =  {};
      
    })
    .catch(function(error){
      self.service.sweetalert_error(error)
    })
  }

}
