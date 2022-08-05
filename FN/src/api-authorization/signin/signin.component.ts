import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import axios from 'axios';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  form: FormGroup;
  showErrorMessage: any;
  errorMessage: string = "";
  role: any;
  course_no: any;
  
  constructor(private readonly fb: FormBuilder, private route:ActivatedRoute, private router: Router) { 

      this.form = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });

      this.route.params.subscribe(params => {
        this.role = params['signin-as'];
        this.course_no = params['course_no'];
      });

    }

  ngOnInit() {
    console.log("Token: ", sessionStorage.getItem('token_hrgis'))
  }

  response :any;
  async login() {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const params = {
        "Username": this.form.value.username,
        "Password": this.form.value.password
      };

      this.response = await instance.post("/Authenticate/login", params);
      sessionStorage.setItem('token_hrgis', this.response.data.token);
      // sessionStorage.setItem('token_expiration_hrgis', this.response.data.expiration);
      
      console.log("Token: ", sessionStorage.getItem('token_hrgis'))

      // if(this.course_no!=null){
      //   window.location.reload();
      // }

      if(this.role=="approver"){
        // console.log("/training/approve-mgr")
        // this.router.navigate([`/training/approve-mgr/${this.course_no}`]);
        location.href = `training/approve-mgr/${this.course_no}`
      }
      else{
        // console.log("/training/")
        // this.router.navigate(['/training']);
        location.href = `training`
      }

      return this.response
    } 
    catch (error) {
      this.errorMessage = typeof error.response.data === 'object'? error.response.data.title:error.response.data
      this.showErrorMessage = true;
    }
  }

}
