import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import axios from 'axios';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public layoutOption: string;
  showHeader:boolean = true;
  showFooter:boolean = false;



  constructor(private router: Router) {
    // Removing Sidebar, Navbar, Footer for Documentation, Error and Auth pages
    router.events.forEach((event) => { 
      // console.log('event: ', event);      
      if(event instanceof NavigationStart) {
        if((event['url'] == '/')  
        || (event['url'] == '/authentication/signin') 
        || (event['url'] == '/authentication/signup') 
        || (event['url'] == '/authentication/page-404') ) {
          this.showHeader = false;
          this.showFooter = false;
        } else {
          this.showHeader = true;
          this.showFooter = false;
        }

        if(window.matchMedia('(max-width: 991px)').matches) {
          document.querySelector('body').classList.remove('az-header-menu-show');
        }
      }
    });
  }

  ngOnInit() {

    console.log("Token: ", localStorage.getItem('token_hrgis'))
    let now = new Date(Date.now());
    let token_expired_date = new Date(localStorage.getItem('token_expiration_hrgis'))
    let token_expired = now>token_expired_date
    
  
    axios.interceptors.response.use(function (response) {
      return response.data
    })
    // navbar backdrop for mobile only
    const navbarBackdrop = document.createElement('div');
    navbarBackdrop.classList.add('az-navbar-backdrop');
    document.querySelector('body').appendChild(navbarBackdrop);
    
    if (localStorage.getItem('token_hrgis') == null) {
      this.router.navigate(['/authentication/signin']);
    }
    if (token_expired) {
      console.log("Token expired")
      localStorage.clear();
      this.router.navigate(['/authentication/signin']);
    }

  }

}
