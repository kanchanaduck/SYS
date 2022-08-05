import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { AppServiceService } from '../../app-service.service';
import { Settings } from 'src/app/settings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menus: any = [];
  now: number;
  _data: any;
  _fullname: any;
  _positions: any;
  img_garoon: any = Settings.IMG_GAROON;
  images: any;
  is_production:boolean = environment.production;

  constructor(private service: AppServiceService, private router: Router) { }

  async ngOnInit() {
    setInterval(() => {
      this.now = Date.now();
    }, 1);

    if (sessionStorage.getItem('token_hrgis') != null) {
      this._data = await this.service.service_jwt(); 
      //console.log('data jwt: ', this._data);
      if(this._data.user.band=="JP"){
        this._fullname = this._data.user.lastname_en + ' ' + this._data.user.firstname_en.substring(0, 1);
      }
      else{
        this._fullname = this._data.user.firstname_en + ' ' + this._data.user.lastname_en.substring(0, 1);
      }
      this._positions = this._data.user.position_name_en;
      this.images = this.img_garoon + this._data.user.emp_no + ".jpg";
    }
  }

  closeMenu(e) {
    e.target.closest('.dropdown').classList.remove('show');
    e.target.closest('.dropdown .dropdown-menu').classList.remove('show');
  }

  toggleHeaderMenu(event) {
    event.preventDefault();
    alert(event)
    document.querySelector('body').classList.toggle('az-header-menu-hide');
  }

  toggleSidebar(event) {
    event.preventDefault();
    if (window.matchMedia('(min-width: 992px)').matches) {
      document.querySelector('body').classList.toggle('az-sidebar-hide');
    }
    else {
      document.querySelector('body').classList.toggle('az-sidebar-show');
    }

  }

  SingOut() {
    sessionStorage.removeItem("token_hrgis");
    this.router.navigate(['authentication/signin']);
  }

}
