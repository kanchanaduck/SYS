import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import axios from 'axios';
import { AppServiceService } from '../../app-service.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent implements OnInit {

  training_menu: any = [];


  constructor(private service: AppServiceService) { 

  }

  ngOnInit(): void {
    this.get_menu_training()
  }

  async get_menu_training() {
    this.training_menu = await this.service.axios_get(`Menus/Children/3`);
    console.log('data: ', this.training_menu);
  }
}



