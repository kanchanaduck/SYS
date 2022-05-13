import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { AppServiceService } from '../../app-service.service';
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
  img_garoon: any = environment.img_garoon;
  images: any;

  constructor(private service: AppServiceService, private router: Router) { }

  async ngOnInit() {
    setInterval(() => {
      this.now = Date.now();
    }, 1);

    if (localStorage.getItem('token_hrgis') != null) {
      this._data = await this.service.service_jwt(); //console.log('data jwt: ', this._data);
      this._fullname = this._data.user.firstname_en + ' ' + this._data.user.lastname_en.substring(0, 1);
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
      localStorage.setItem("hrgis_sidebar_show", "false");
    }
    else {
      document.querySelector('body').classList.toggle('az-sidebar-show');
      localStorage.setItem("hrgis_sidebar_show", "true");
    }
    // document.querySelector('.az-sidebar').classList.toggle('d-flex');

  }

  SingOut() {
    localStorage.clear();
    this.router.navigate(['authentication/signin']);
  }

}
