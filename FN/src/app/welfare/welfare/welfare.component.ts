import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welfare',
  templateUrl: './welfare.component.html',
  styleUrls: ['./welfare.component.scss']
})
export class WelfareComponent implements OnInit {

  menus_maintenance: any=[];
  menus_inquiry: any=[];
  menus_report: any=[];

  constructor() { }

  ngOnInit() {
    axios.get('/assets/PEF.json').then(response => (
      this.menus_maintenance = response.data
    ));

    axios.get('/assets/PEI.json').then(response => (
      this.menus_inquiry = response.data
    ));

    axios.get('/assets/PER_O.json').then(response => (
      this.menus_report = response.data
    ));
  }

}
