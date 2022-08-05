import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import axios from 'axios';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public layoutOption: string;
  showHeader:boolean = true;
  showFooter:boolean = false;

  constructor(private router: Router, private titleService:Title) {

    if(environment.production){
      this.titleService.setTitle("HRGIS")
    }
    else{
      this.titleService.setTitle("HRGIS - TEST")
    }
    
    // Removing Sidebar, Navbar, Footer for Documentation, Error and Auth pages
    router.events.forEach((event) => { 
      // console.log('event: ', event);      
      if(event instanceof NavigationStart) {
        console.log(event['url'])
        if((event['url'] == '/')  
        || (event['url'].includes('/authentication/signin')) 
        || (event['url'] == '/authentication/signup') 
        || (event['url'] == '/authentication/page-404') ) {
          this.showHeader = false;
          this.showFooter = false;
        }
        else {
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
    axios.interceptors.response.use(function (response) {
      return response.data
    })
  }

}
