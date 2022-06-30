import { Component, Inject, OnInit } from '@angular/core';
import axios from 'axios';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AppServiceService } from 'src/app/app-service.service';
import { HttpClient } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-users',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.scss']
})
export class ManualComponent implements OnInit {



  constructor(private service: AppServiceService, private httpClient: HttpClient) {

  }

  ngOnInit(): void {

  }


}