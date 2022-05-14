import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { environment } from '../../../environments/environment';
import { AppServiceService } from '../../app-service.service';
import { ExportService } from '../../export.service';
import axios from 'axios';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-approve-final',
  templateUrl: './approve-final.component.html',
  styleUrls: ['./approve-final.component.scss']
})
export class ApproveFinalComponent implements AfterViewInit, OnDestroy, OnInit {

  headers: any = {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
      'Content-Type': 'application/json'
    }
  }
  data_grid: any = [];
  // datatable
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false
  // end datatable
  @ViewChild("txtgroup") txtgroup: any;
  @ViewChild("txtqty") txtqty: any;
  @ViewChild("txtdate_from") txtdate_from: any;
  @ViewChild("txtdate_to") txtdate_to: any;
  @ViewChild("txtposition") txtposition: any;
  @ViewChild("txtband") txtband: any;
  @ViewChild("txtdept") txtdept: any;
  _getjwt: any;
  _emp_no: any;
  _org_abb: string = "";
  checkboxesDataList: any[];
  not_pass: boolean = false;
  disabled_chkall: boolean = false;
  visableButton: boolean = false;
  isreadonly: boolean = true;
  isIf: boolean = false;
  txt_not_pass = '';
  v_regis: number = 0;
  v_wait: number = 0;
  v_total: number = 0;
  open_register: boolean = false;

  submitted = false;
  is_committee: boolean;
  committee_org_code: string;
  errors: any;
  
  course_no:string;
  course: any={};
  courses: any=[];
  response: any;
  emp_no: string = "";
  emp_name: string;
  emp_status: string;
  _checkbox: any = 0;

  constructor(private modalService: NgbModal, private service: AppServiceService, private exportexcel: ExportService) {

  }
  ngOnInit() {
    this._getjwt = this.service.service_jwt();  // get jwt
    this._emp_no = this._getjwt.user.emp_no; // set emp_no
    this.check_is_committee()

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
        "dom": {
          "container": {
            tag: "div",
            className: "dt-buttons btn-group flex-wrap float-right"
          },
          "button": {
            tag: "button",
            className: "btn btn-sm"
          },
        },
        "buttons": [
          {
            extend: 'pageLength',
            className: "btn-outline-indigo"
          },
          {
            extend: 'copy',
            text: '<i class="fas fa-copy"></i> Copy</button>',
            className: "btn-outline-indigo"
          },
          {
            extend: 'print',
            text: '<i class="fas fa-print"></i> Print</button>',
            className: "btn-outline-indigo"
          },
          {
            extend: 'collection',
            text: '<i class="fas fa-cloud-download-alt"></i> Download</button>',
            className: "btn-outline-indigo",
            buttons: [
              {
                extend: 'excel',
                text: '<i class="far fa-file-excel"></i> Excel</button>',
              },
            ]
          }, 
          {
            text: '<i class="fas fa-check"></i> Approve</button>',
            className: "btn-indigo",
            key: '1',
            action: () => {
                this.approve();
            }
          }
        ],
      },
      container: "#example_wrapper .col-md-6:eq(0)",
      lengthMenu: [[10, 25, 50, 75, 100, -1], [10, 25, 50, 75, 100, "All"]],
      order: [[1, 'asc']],
      columnDefs: [
        {
          targets: [0, 11],
          orderable: false
        }
      ],
    };
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // barChartData2 = [{
  //   label: '# of Votes',
  //   data: [12, 39, 20, 10, 25, 18],
  // }];
  // barChartLabels = ['ACC', 'CAO', 'ICD', 'MTP', 'PGA-1', 'PGA-2'];
  // barChartOptions = {
  //   scales: {
  //     yAxes: [{
  //       ticks: {
  //         beginAtZero: true,
  //         fontSize: 10,
  //         min: 0,
  //         max: 80
  //       }
  //     }],
  //     xAxes: [{
  //       barPercentage: 0.6,
  //       ticks: {
  //         beginAtZero: true,
  //         fontSize: 11
  //       }
  //     }]
  //   },
  //   legend: {
  //     display: false
  //   },
  //   elements: {
  //     point: {
  //       radius: 0
  //     }
  //   }
  // };  
  barChartData2: any;
  barChartLabels: any;
  barChartOptions: any;
  barChartColors2 = [
    {
      borderColor: '#560bd0', //'#560bd0', 'rgba(0,123,255,.5)'
      backgroundColor: '#560bd0'
    }
  ];

  async open(content) {

    this.res_chart = await this.service.axios_get('OtherData/GetChartFinal?course_no=' + this.course.master_course_no);
    console.log(this.res_chart);
    this.c_course_no = this.course.master_course_no
    this.c_course_name_en = `${this.res_chart.master_course.course_name_th}(${this.res_chart.master_course.course_name_en})`
    if(this.res_chart.data.length > 0){
      var total = this.res_chart.data.map(function (item) {
        return item.total;
      }); // console.log(total);

      // console.log(((Math.ceil((Math.max(...total) / 10)) * 10) - Math.max(...total)));
      // console.log(((Math.ceil((Math.max(27) / 10)) * 10) - Math.max(27)));

      this.chartmax = Math.max(...total) + ((Math.ceil((Math.max(...total) / 10)) * 10) - Math.max(...total));

      var chartlabels = this.res_chart.chartlabels.map(function (item) {
        return item.dept_abb;
      }); // console.log(chartlabels);

      this.barChartData2 = [{
        // label: '# of Value',
        labels: total,
        data: total,
      }];
      this.barChartLabels = chartlabels;
      this.barChartOptions = {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              fontSize: 10,
              min: 0,
              max: this.chartmax
            }
          }],
          xAxes: [{
            barPercentage: 0.6,
            ticks: {
              beginAtZero: true,
              fontSize: 11
            }
          }]
        },
        legend: {
          display: false
        },
        elements: {
          point: {
            radius: 0
          }
        }
      };

      this.modalService.open(content, {
        size: 'lg' //sm, mb, lg, xl
      });
    }
    else{
      Swal.fire({
        icon: 'warning',
        text: 'There is no data to show'
      })
    }
  } // Popup chart

  async check_is_committee() {
    let self = this
    await this.service.gethttp('Stakeholder/Committee/' + self._emp_no)
      .subscribe((response: any) => {
        console.log(response)
        self.is_committee = true;
        self._org_code = response.org_code
        self._org_abb = response.organization.org_abb
        self.get_courses_owner()
      }, (error: any) => {
        console.log(error);
        self.is_committee = false;
      }); 
  }

  async get_course() {
    let self = this

    if(this.course_no==null)
    {
      this.course = {};
      this.data_grid = [];
      self.get_registrant()
    }
    else
    {
      self.data_grid = [];
      axios.get(`${environment.API_URL}Courses/Trainers/${self.course_no}`,self.headers)
        .then(function(response){
          self.response = response
          self.course = self.response.courses
          self.arr_band = self.response.courses.courses_bands
          let trainers = self.response.trainers
          if(trainers.length>0){
            self.course.trainer_text = trainers.map(c => c.display_name).join(', ');
          }
          else{
            self.course.trainer_text = "-"
          }
          let bands = self.arr_band
          if(bands.length>0){
            self.course.band_text = bands.map(c => c.band).join(', ');
          }
          else{
            self.course.band_text = "-"
          }
          self.get_registrant()
        })
        .catch(function(error){
          self.service.sweetalert_error(error)
          self.course = {};
          return false;
      });      
    }
  }

  async get_courses_owner(){
    let self = this
    await axios.get(`${environment.API_URL}Courses/Owner/${this._org_code}/Open`, this.headers)
    .then(function(response){
      self.courses = response
      self.get_course()
    })
    .catch(function(error){

    });
  }

  custom_search_course_fn(term: string, item: any) {
    term = term.toLowerCase();
    return item.course_no.toLowerCase().indexOf(term) > -1 ||  item.course_name_th.toLowerCase().indexOf(term) > -1;
  }


  async register() {
    const send_data = {
      course_no: this.course_no,
      emp_no: this.emp_no,
      last_status: (this.data_grid.length + 1) > this.course.capacity ? environment.text.wait : 'Approved',
      remark: this.txt_not_pass
    }
    let self = this
    await axios.post(`${environment.API_URL}Register/ByCommitteeCourse`, send_data, this.headers)
    .then(function(response){
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: "Success",
        showConfirmButton: false,
        timer: 2000
      })
      self.get_registrant();
      self.fnClear()
    })
    .catch(function(error){
      self.errors = error.response.data.errors
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: typeof error.response.data === 'object'? error.response.data.title:error.response.data
      })
    })
  }

  
  approve() {  
    if(this._org_code != this.course.org_code){ 
      Swal.fire({
        icon: 'error',
        text: environment.text.invalid_course
      })
      return; 
    }

    let text = "";

    if (this.array_grid.length > 0) {
      text = "you want to approve these trainees";
    } 
    else {
      text = "you want to cancle approve these trainees"
    }

    Swal.fire({
      title: 'Are you sure?',
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.value) {
        for (var i = 0; i < this.data_grid.length; i++) {
          this.data_grid[i].final_approved_checked = false;
        }

        for (const iterator of this.array_grid) {
          let _objIndex = this.data_grid.findIndex((obj => obj.emp_no == iterator.emp_no));
          this.data_grid[_objIndex].last_status = "Approved"
          this.data_grid[_objIndex].final_approved_checked = true;
        }

        Array.prototype.push.apply(this.array_grid, this.data_grid); 
        this.array_grid = removeDuplicateObjectFromArray(this.array_grid, 'emp_no'); 

        await this.service.axios_put(`Register/FinalApprove/${this.course_no}`, this.array_grid, environment.text.success);
        await this.get_registrant();
        this.selection.clear();
        this.array_grid = [];
      }
    })
  }


  fnClear() {
    this.errors = {}
    this.emp_no = "";
    this.emp_name = "";
    this.txtdept.nativeElement.value = "";
    this.txtposition.nativeElement.value = "";
    this.txtband.nativeElement.value = "";
    this.txt_not_pass = "";
  }
  
  fnDelete(emp_no) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'you want to delete this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.value) {
        await this.service.axios_delete(`Register/${this.course_no}/${emp_no}`, environment.text.delete);
        this.get_registrant();
      }
    })
  }

  res_course: any = [];
  arr_band: any;

  onKeyEmpno() {
    if (this.emp_no.length >= 6 && this.emp_no.length <= 7) {
      this.searchEmp(this.emp_no);
      this.searchPrevCourse(this.emp_no);
    } 
    else if (this.emp_no.length == 0) {
      this.fnClear();
    }
  }

  res_emp: any = [];
  dept_emp: any = ''; div_emp: any = '';
  async searchEmp(empno: any) {
    this.res_emp = await this.service.axios_get('Employees/' + empno); // console.log('searchEmp: ', this.res_emp);
    if (this.res_emp != null || this.res_emp != undefined) {
      this.emp_name = this.res_emp.title_name_en + " " + this.res_emp.firstname_en + " " + this.res_emp.lastname_en;
      this.dept_emp = this.res_emp.dept_abb;
      this.div_emp = this.res_emp.div_abb;
      this.emp_status = this.res_emp.employed_status
      this.txtdept.nativeElement.value = `${this.res_emp.div_abb}/${this.res_emp.dept_abb}`;
      this.txtposition.nativeElement.value = this.res_emp.position_name_en;
      this.txtband.nativeElement.value = this.res_emp.band;
    } else {
      this.emp_name= "";
      this.emp_status = "";
      this.txtdept.nativeElement.value = "";
      this.txtposition.nativeElement.value = "";
      this.txtband.nativeElement.value = "";
    }
  }
  res_prev: any;
  async searchPrevCourse(empno: any) {
    this.res_prev = await this.service.axios_get('Register/GetPrevCourse/' + this.course_no + '/' + empno); // console.log('searchPrevCourse: ', this.res_prev);
    if (this.res_prev != "" || this.res_prev != null) {
      this.txt_not_pass = this.res_prev;
      this.not_pass = true;
    }
  }

  /** File Upload, Download */
  dowloadFormat() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'assets/format/format input training.xlsx');
    link.setAttribute('download', `format input training.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  nameFile: string = 'Choose file';
  file: any;
  fileName: any;
  chooseFile(e: any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.file = e.target.files[0];
      this.fileName = e.target.files[0].name;
      this.nameFile = this.fileName;
    }
  }
  result: any;
  async upload() {
    
    if(this.course_no===undefined){
      console.log(this.course_no)
      this.errors =  {
        course_no: ["Please select course no."]
      };
      console.log(this.errors.course_no)
      return;
    }

    let formData = new FormData();
    if (this.file !== undefined && this.file !== "" && this.file !== null) {
      formData.append('file_form', this.file)
      formData.append('file_name', this.fileName)
      formData.append('dept_abb', this._org_abb)
      formData.append('capacity', this.txtqty.nativeElement.value)
    }

    this.result = await this.service.axios_formdata_post('/Register/UploadCourseRegistration/' + this.course_no, formData, environment.text.success);
    // console.log('result: ', this.result.data);
    if (this.result.data.length > 0) {
      let element = this.result.data;
      this.exportexcel.exportJSONToExcel(element, 'ResultRegistration');
    }

    this.nameFile = 'Choose file';
    await this.get_registrant();
  }
  /** End File Upload, Download */


  selection = new SelectionModel<DataTablesResponse>(true, []);
  array_grid = [];
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.data_grid.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.data_grid);
  }

  checkboxLabel(row?: DataTablesResponse): string {
    if (!row) {
      this.array_grid = this.selection.selected;
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.emp_no + 1}`;
  }

  toggleSelection(row) {
    if ((this.selection.selected.length < this.course.capacity) || this.selection.isSelected(row)) {
      this.selection.toggle(row);
    }
    this.array_grid = this.selection.selected;
    this._checkbox = this.array_grid.length;
  }

  res_chart: any = [];
  chartmax: any;
  c_course_no: any; c_course_name_en: any;
  _org_code:any;

  async get_registrant() {

    if(this.course_no==null){
      this.rerender();
    }

    await this.service.gethttp(`Register/${this.course_no}`)
      .subscribe((response: any) => {
        this.data_grid = response;

        let chk_true = response.filter(x => x.last_status=="Approved");
        if (chk_true.length > 0) {
          this.selection = new SelectionModel<DataTablesResponse>(true, chk_true)
          console.log("1", this.selection.selected);
        }
        else
        {
          this.selection = new SelectionModel<DataTablesResponse>(true, []);
          console.log("2", this.selection.selected);
        }

        this.v_regis = this.data_grid.filter(x => x.last_status != environment.text.wait).length;
        this.v_wait = this.data_grid.filter(x => x.last_status == environment.text.wait).length;
        this.v_total = this.data_grid.length;

        if(this.v_total>this.course.capacity){
          this.disabled_chkall = true
        }
        else{
          this.disabled_chkall = false
        }

        this._checkbox = this.data_grid.filter(x => x.final_approved_checked == true).length;

        this.rerender();
    }, (error: any) => {
        console.log(error);
        this.data_grid = [];
        this.rerender();
      });
  }

  rerender(){
    if (this.isDtInitialized) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.clear().draw()
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } 
    else {
      this.isDtInitialized = true
      this.dtTrigger.next();
    }
  }

}


function removeDuplicateObjectFromArray(array, key) {
  return array.filter((obj, index, self) =>
    index === self.findIndex((el) => (
      el[key] === obj[key]
    ))
  )
}

export interface DataTablesResponse {
  band: string;
  final_approved_checked: boolean;
  course_name_en: string;
  course_no: string;
  dept_abb: string;
  dept_code: string;
  emp_no: string;
  firstname_en: string;
  lastname_en: string;
  last_status: string;
  manager_approved_checked: boolean;
  position_code: string;
  position_name_en: string;
  remark: string;
  seq_no: number;
  title_name_en: string;
}