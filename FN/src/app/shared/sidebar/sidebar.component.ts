import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import axios from 'axios';
import { ActivatedRoute, Router } from '@angular/router';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {

  menus: any = [];
  _data: any;
  _fullname: any;
  _positions: any;
  img_garoon: any = environment.img_garoon;
  images: any;
  activeUrl: any;
  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  _emp_no: any;

  constructor(
    private service: AppServiceService, 
    private router: Router, 
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {

    this.activeUrl = this.route

    await axios.get(`${environment.API_URL}Menus`, this.headers).then(response => (
      this.menus = response
    ));

    if (localStorage.getItem('token_hrgis') != null) {
      this._data = await this.service.service_jwt(); 
      this._fullname = this._data.user.firstname_en + ' ' + this._data.user.lastname_en.substring(0, 1);
      this._emp_no = this._data.user.emp_no;
      this._positions = this._data.user.position_name_en;
      this.images = this.img_garoon + this._data.user.emp_no + ".jpg";
    }
  }

}
