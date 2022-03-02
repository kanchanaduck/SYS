import { Component, OnDestroy, OnInit } from '@angular/core';
import axios from 'axios';
import { Subject } from 'rxjs';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
// import { Locker } from './locker';

@Component({
  selector: 'app-locker',
  templateUrl: './locker.component.html',
  styleUrls: ['./locker.component.scss']
})
export class LockerComponent implements OnInit {
  dtOptions: DataTables.Settings = {};


  closeResult = '';
  constructor(private modalService: NgbModal) { }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      ajax: {
        url: '/assets/locker.json',
        dataSrc: '',
      },
      columns: [
        {
          title: 'LOCK NO',
          data: 'lock_no'
        }, 
        {
          title: 'Sex',
          data: 'sex'
        }, 
        {
          title: 'EMP NO',
          data: 'emp_no'
        },
        {
          title: 'NAME',
          data: 'name'
        }, 
        {
          title: 'DEPT',
          data: 'dept'
        }, 
        {
          title: 'ENTR DATE',
          data: 'entr_date'
        },
        /* {
          title: 'RESIGN',
          data: 'resign'
        },  */
        /* {
          title: 'CATEGORY',
          data: 'category'
        },  */
        {
          title: 'RETURN_KEY',
          data: 'return_key'
        },
        {
          title: 'UPD DATE',
          data: 'upd_date'
        }, 
        {
          title: 'REMARK',
          data: 'remark'
        }, 
        {
          title: '',
          data: 'lock_no',
          render: function(data, type) {
            return '<a (click)="open(content)"><i class="fas fa-ellipsis-v"></i></a>';
          }
        }
      ]
    }
  }

  /* dtOptions: DataTables.Settings = {};
  lockers: Locker[] = [];

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2
    };
    this.httpClient.get<Locker[]>('/assets/locker.json')
      .subscribe(data => {
        this.lockers = (data as any).data;
        // Calling the DT trigger to manually render the table
        this.dtTrigger.next();
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  } */

}


interface Locker {
  lock_no: string;
  sex: string;
  emp_no: string;
  name: string;
  dept: string;
  entr_date: string;
  resign: string;
  category: string;
  return_key: string;
  upd_date: string;
  remark: string;
}
