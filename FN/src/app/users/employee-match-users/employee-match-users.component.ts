import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-match-users',
  templateUrl: './employee-match-users.component.html',
  styleUrls: ['./employee-match-users.component.scss']
})
export class EmployeeMatchUsersComponent implements OnInit {

  dtOptions: any = {};
  employees: any = {};
  users: any = {};
  c: any = {};

  constructor() { }

  ngOnInit(): void {

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
      buttons: {
        "dom":{
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-right"
          },
          "button": {
            tag: "button",
            className: "btn btn-outline-indigo btn-sm"
          },
        },
        "buttons": [
          {
            extend:'pageLength',
          },
          {
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="far fa-file-excel"></i> Excel</button>',
                },
                {
                    text: '<i class="far fa-file-excel"></i> History</button>',
                    action: function ( e, dt, node, config ) {
                       alert('เอาไว้ดาวน์โหลดประวัติการสอนค่าาา')
                    }
                },
            ]
          },
        ],
      },
      order: [[3, 'asc'], [4, 'asc'], [5, 'desc'], [6, 'desc'], [1, 'asc']],
      rowGroup: {
        dataSrc: [ 3, 4 ]
      },
      columnDefs: [ 
        {
          targets: [ 0, 9],
          orderable: false 
        } 
      ],

      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
    };


   /*  this.users = [
      {
        "UserName": "014496"
      },
      {
        "UserName": "000094"
      }
    ]

    this.employees = [
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "J032931",
          "title_name_en": "MR.",
          "firstname_en": "HIDEKI",
          "firstname_en": "KUSADOME",
          "title_name_th": "นาย",
          "firstname_th": "ฮิเดะกิ",
          "lastname_th": "คุสะโดะเมะ",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "JP",
          "position_code": "999",
          "position_name_en": "DEPARTMENT MANAGER",
          "probation_date": null,
          "EMAIL": "kusadome.hideki@mail.canon",
          "EMAIL_ACTIVE_DATE": "20190306"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "014749",
          "title_name_en": "MR.",
          "firstname_en": "NATIRUT",
          "firstname_en": "DAUNGPAK",
          "title_name_th": "นาย",
          "firstname_th": "นติรุต",
          "lastname_th": "ดวงภาค",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2020-11-15T17:00:00.000Z",
          "EMAIL": "natirut@mail.canon",
          "EMAIL_ACTIVE_DATE": "20200804"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "011924",
          "title_name_en": "MR.",
          "firstname_en": "WARAGON",
          "firstname_en": "GATAPONG",
          "title_name_th": "นาย",
          "firstname_th": "วรากร",
          "lastname_th": "กัตพงษ์",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "521",
          "position_name_en": "SENIOR PROGRAMMER",
          "probation_date": "2018-02-11T17:00:00.000Z",
          "EMAIL": "waragon@mail.canon",
          "EMAIL_ACTIVE_DATE": "20171025"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "000083",
          "title_name_en": "MR.",
          "firstname_en": "SARAWUT",
          "firstname_en": "JINATO",
          "title_name_th": "นาย",
          "firstname_th": "ศราวุธ",
          "lastname_th": "จินาโต",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J3",
          "position_code": "604",
          "position_name_en": "SYSTEM ANALYST",
          "probation_date": "2012-11-04T17:00:00.000Z",
          "EMAIL": "sarawut083@mail.canon",
          "EMAIL_ACTIVE_DATE": "20121231"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "011125",
          "title_name_en": "MR.",
          "firstname_en": "SUPAKIT",
          "firstname_en": "JANTARARATMANEE",
          "title_name_th": "นาย",
          "firstname_th": "ศุภกิจ",
          "lastname_th": "จันทรรัตน์มณี",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "521",
          "position_name_en": "SENIOR PROGRAMMER",
          "probation_date": "2017-10-01T17:00:00.000Z",
          "EMAIL": "supakit@mail.canon",
          "EMAIL_ACTIVE_DATE": "20170613"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "014846",
          "title_name_en": "MR.",
          "firstname_en": "SUMET",
          "firstname_en": "PHUPHAKDEE",
          "title_name_th": "นาย",
          "firstname_th": "สุเมธ",
          "lastname_th": "ภูภักดี",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2021-01-24T17:00:00.000Z",
          "EMAIL": "sumet690@mail.canon",
          "EMAIL_ACTIVE_DATE": "20201006"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "013173",
          "title_name_en": "MR.",
          "firstname_en": "WORRAWUT",
          "firstname_en": "CHIRAPRAPHUN",
          "title_name_th": "นาย",
          "firstname_th": "วรวุฒิ",
          "lastname_th": "จิรประพันธ์",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "521",
          "position_name_en": "SENIOR PROGRAMMER",
          "probation_date": "2019-06-02T17:00:00.000Z",
          "EMAIL": "worrawut@mail.canon",
          "EMAIL_ACTIVE_DATE": "20190212"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "000147",
          "title_name_en": "MR.",
          "firstname_en": "PRASIT",
          "firstname_en": "SAENGKAEW",
          "title_name_th": "นาย",
          "firstname_th": "ประสิทธิ์",
          "lastname_th": "แสงแก้ว",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J3",
          "position_code": "604",
          "position_name_en": "SYSTEM ANALYST",
          "probation_date": "2013-01-06T17:00:00.000Z",
          "EMAIL": "prasit@mail.canon",
          "EMAIL_ACTIVE_DATE": "20121231"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "011112",
          "title_name_en": "MR.",
          "firstname_en": "SURIN",
          "firstname_en": "CHOCHOY",
          "title_name_th": "นาย",
          "firstname_th": "สุรินทร์",
          "lastname_th": "ช่อช้อย",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2017-09-17T17:00:00.000Z",
          "EMAIL": "surin@mail.canon",
          "EMAIL_ACTIVE_DATE": "20170613"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "016045",
          "title_name_en": "MR.",
          "firstname_en": "CHATPIMUK",
          "firstname_en": "KHEMKOT",
          "title_name_th": "นาย",
          "firstname_th": "ชัชพิมุข",
          "lastname_th": "เข็มโคตร",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J1",
          "position_code": "500",
          "position_name_en": "TECHNICIAN",
          "probation_date": "2022-01-30T17:00:00.000Z",
          "EMAIL": "chatpimuk@mail.canon",
          "EMAIL_ACTIVE_DATE": "20211015"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "015366",
          "title_name_en": "MR.",
          "firstname_en": "NOPPADOL",
          "firstname_en": "DEEWAN",
          "title_name_th": "นาย",
          "firstname_th": "นพดล",
          "lastname_th": "ดีวัน",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J3",
          "position_code": "604",
          "position_name_en": "SYSTEM ANALYST",
          "probation_date": "2021-08-31T17:00:00.000Z",
          "EMAIL": "noppadol@mail.canon",
          "EMAIL_ACTIVE_DATE": "20210510"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "013380",
          "title_name_en": "MISS",
          "firstname_en": "CHINTANA",
          "firstname_en": "CHANCHAENG",
          "title_name_th": "นางสาว",
          "firstname_th": "จินตนา",
          "lastname_th": "จันทร์แจ้ง",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2019-08-18T17:00:00.000Z",
          "EMAIL": "chintana@mail.canon",
          "EMAIL_ACTIVE_DATE": "20190425"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "306351",
          "title_name_en": "MISS",
          "firstname_en": "CHADAPORN",
          "firstname_en": "THEPPATCHA",
          "title_name_th": "นางสาว",
          "firstname_th": "ชฎาพร",
          "lastname_th": "เทพปัชฌาย์",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": "2022-09-15T17:00:00.000Z",
          "BAND": "E",
          "position_code": "304",
          "position_name_en": "OPERATOR ST",
          "probation_date": null,
          "EMAIL": "chadaporn@mail.canon",
          "EMAIL_ACTIVE_DATE": "20211116"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "005042",
          "title_name_en": "MR.",
          "firstname_en": "CHALERMCHAI",
          "firstname_en": "PONANG",
          "title_name_th": "นาย",
          "firstname_th": "เฉลิมชัย",
          "lastname_th": "โพธิ์นาง",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J3",
          "position_code": "604",
          "position_name_en": "SYSTEM ANALYST",
          "probation_date": "2015-02-01T17:00:00.000Z",
          "EMAIL": "chalermchai@mail.canon",
          "EMAIL_ACTIVE_DATE": "20141014"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "013817",
          "title_name_en": "MR.",
          "firstname_en": "SUWANNASON",
          "firstname_en": "SISUK",
          "title_name_th": "นาย",
          "firstname_th": "สุวรรณศร",
          "lastname_th": "ศรีสุข",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": "2021-12-27T17:00:00.000Z",
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2020-02-10T17:00:00.000Z",
          "EMAIL": "suwannason@mail.canon",
          "EMAIL_ACTIVE_DATE": "20191022"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "000094",
          "title_name_en": "MISS",
          "firstname_en": "NOPPAMAS",
          "firstname_en": "TONGDEE",
          "title_name_th": "นางสาว",
          "firstname_th": "นพมาศ",
          "lastname_th": "ต้องดี",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "M1",
          "position_code": "704",
          "position_name_en": "MISSION MANAGER",
          "probation_date": "2012-11-27T17:00:00.000Z",
          "EMAIL": "noppamas@mail.canon",
          "EMAIL_ACTIVE_DATE": "20121231"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "013364",
          "title_name_en": "MISS",
          "firstname_en": "NUCHCHANAT",
          "firstname_en": "SINGSOMDEE",
          "title_name_th": "นางสาว",
          "firstname_th": "นุชนาถ",
          "lastname_th": "สิงสมดี",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2019-07-14T17:00:00.000Z",
          "EMAIL": "nuchchanat@mail.canon",
          "EMAIL_ACTIVE_DATE": "20190326"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "014496",
          "title_name_en": "MISS",
          "firstname_en": "KANCHANA",
          "firstname_en": "SAIPANUS",
          "title_name_th": "นางสาว",
          "firstname_th": "กาญจนา",
          "lastname_th": "สายพนัส",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "521",
          "position_name_en": "SENIOR PROGRAMMER",
          "probation_date": "2020-10-11T17:00:00.000Z",
          "EMAIL": "kanchana@mail.canon",
          "EMAIL_ACTIVE_DATE": "20200629"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "014205",
          "title_name_en": "MR.",
          "firstname_en": "KHETCHANA",
          "firstname_en": "KETSAUAONG",
          "title_name_th": "นาย",
          "firstname_th": "เขตชนะ",
          "lastname_th": "เกษสาวงค์",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J1",
          "position_code": "500",
          "position_name_en": "TECHNICIAN",
          "probation_date": "2020-06-21T17:00:00.000Z",
          "EMAIL": "khetchana@mail.canon",
          "EMAIL_ACTIVE_DATE": "20200303"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "013816",
          "title_name_en": "MISS",
          "firstname_en": "PHATTANAN",
          "firstname_en": "KUNAPASUT",
          "title_name_th": "นางสาว",
          "firstname_th": "พัทธนันท์",
          "lastname_th": "คุณปสุต",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "520",
          "position_name_en": "TRANSLATOR",
          "probation_date": "2020-02-02T17:00:00.000Z",
          "EMAIL": "phattanan@mail.canon",
          "EMAIL_ACTIVE_DATE": "20191015"
        },
        {
          "OLD_EMP_NO": null,
          "EMP_NO": "014748",
          "title_name_en": "MISS",
          "firstname_en": "NUTTAYA",
          "firstname_en": "KALLA",
          "title_name_th": "นางสาว",
          "firstname_th": "นุตยา",
          "lastname_th": "กัลลา",
          "div_code": "22",
          "DIV_NAME": "CORPORATE PLANNING",
          "div_abb": "CPD",
          "DEPT_CODE": "2230",
          "dept_abb": "ICD",
          "DEPT_NAME": "INFORMATION&COMMUNICATION SYS.",
          "WC_CODE": "2230",
          "wc_abb": "ICD",
          "WC_NAME": "INFORMATION&COMMUNICATION SYS.",
          "resign_date": null,
          "BAND": "J2",
          "position_code": "517",
          "position_name_en": "PROGRAMMER",
          "probation_date": "2020-11-15T17:00:00.000Z",
          "EMAIL": "nuttaya001@mail.canon",
          "EMAIL_ACTIVE_DATE": "20200804"
        }
      ] */

    /* const mergeById = (a1, a2) =>
    a1.map(itm => ({
        ...a2.find((item) => (item.UserName === itm.EMP_NO) && item),
        ...itm
    }));

    this.c = mergeById(this.employees, this.users) */
  }


}