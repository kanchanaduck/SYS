import { Component, OnInit } from '@angular/core';
import 'datatables.net-bs4'
import 'datatables.net-buttons-bs4'
import 'datatables.net-fixedheader-bs4'
import 'datatables.net-fixedcolumns-bs4'

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {

  constructor() { }

  emp: any = {};
  courses: any = {};
  dtOptions: any = {};
  table: any = {};

  ngOnInit(): void {

    this.emp = [
      {
        "emp_no": "J032931",
        "firstname_en": "HIDEKI",
        "lastname_en": "KUSADOME"
      },
      {
        "emp_no": "000094",
        "firstname_en": "NOPPAMAS",
        "lastname_en": "TONGDEE"
      },
      {
        "emp_no": "000083",
        "firstname_en": "SARAWUT",
        "lastname_en": "JINATO"
      },
      {
        "emp_no": "005042",
        "firstname_en": "CHALERMCHAI",
        "lastname_en": "PONANG"
      },
      {
        "emp_no": "014496",
        "firstname_en": "KANCHANA",
        "lastname_en": "SAIPANUS"
      },
    ]


    this.courses = [
      "BOI-002: BOI HANDLING OF IRREGULAR SHIPMENT",
      "CHT-011: SEQUENCER CYLINDER CONTROL",
      "CHT-012: DIE FITTING",
      "CHT-013: BASIC INJECTION MOLDING",
      "CHT-015: CHIE-TECH WORKSHOP BY LEGO",
      "CHT-016: QUALITY SENSING AND INSPECTION",
      "CHT-017: MS.POWERPOINT LEVEL1",
      "CHT-018: MS.ACCESS LEVEL 1",
      "CHT-019: VBA IN EXCEL",
      "CHT-020: MACRO IN EXCEL LEVEL1",
      "CHT-024: 3D MODELING WITH NX8.5",
      "CHT-026: CHARACTERISTIC OF DEFECT MOLDING PART",
      "CHT-028: MOLD PRODUCTION TECHNICAL SKILL LEVEL3",
      "CHT-029: PLC OMRON LEVEL1",
      "CHT-030: SEQUENCER REGISTER CONTROL (PLC + MOTOR)",
      "CHT-031: ELECTRO-PNEUMATIC DESIGN",
      "CHT-032: PLC KEYENCE BASIC",
      "CPO-013: ISO CD9001 : 2015",
      "CPO-015: UNCERTAINTY OF MEASUREMENT CLASS 1",
      "CPT-003: HOW TO READ MECHANICAL DRAWING",
      "CPT-006: SOLDERING PB FREE TRAINING LEVEL 2",
      "CPT-018: VE BASIC",
      "CPT-020: EXCEL BASIC",
      "CPT-022: ELECTRONICS CIRCUIT BASICS",

    ]

    this.dtOptions = {
      dom: "<'row'<'col-sm-12 col-md-4'f><'col-sm-12 col-md-8'B>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-4'i><'col-sm-12 col-md-8'p>>",
      language: {
        paginate: {
          next: '<i class="icon ion-ios-arrow-forward"></i>', // or '→'
          previous: '<i class="icon ion-ios-arrow-back"></i>' // or '←' 
        }
      },
      filter:{
        "dom":{
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-left"
          },
        }
       }, 
      buttons: {
        "dom":{
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-right"
          },
          "button": {
            tag: "button",
            className: "btn btn-az-primary btn-sm"
          },
        },
        "buttons": [
          {
            extend:'pageLength',
          },
          {
            extend: 'copy',
            text: '<i class="fas fa-copy"></i> Copy</button>',
          },
          {
            extend: 'print',
            text: '<i class="fas fa-print"></i> Print</button>',
          },
        ],
      },
      order: [[0, 'desc']],
      columnDefs: [ 
        {
          targets: [ 4, 5 ],
          orderable: false 
        } 
      ],


      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };
  }

}
