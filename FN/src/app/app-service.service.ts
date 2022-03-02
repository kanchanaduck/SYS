import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { environment } from '../environments/environment';
import Swal from 'sweetalert2';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(private http: HttpClient) {}

  gethttp(url: any) {
    return this.http.get(environment.API_URL + url, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'), Pragma: 'no-cache' } });
  }

  async axios_get(url: any) {
    try {
      const response = await axios.get(environment.API_URL + url, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'), Pragma: 'no-cache' } });

      return response;
    } catch (error) {
      console.error(error.stack);
    }
  }

  async axios_post(url: any, data: any, text: string) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
          'Content-Type': 'application/json'
        }
      });
      const response = await instance.post(url, data);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 2000
      })

      return response;
    } catch (error) {
      console.error(error.stack);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }
  }

  async axios_put(url: any, data: any, text: string) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        }
      });
      const response = await instance.put(url, data);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 2000
      })

      return response;
    } catch (error) {
      console.log('RES ERROR: ', error.response);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }
  }

  async axios_delete(url: any, text: string) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
          'Content-Type': 'application/json'
        }
      });
      const response = await instance.delete(url);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 2000
      })

      return response;
    } catch (error) {
      console.log('RES ERROR: ', error.response);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }
  }

  async axios_delete_patch(url: any, data: any, text: string) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
          'Content-Type': 'application/json'
        }
      });
      const response = await instance.patch(url, data);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 2000
      })

      return response;
    } catch (error) {
      console.log('RES ERROR: ', error.response);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }
  }

  async axios_formdata_post(url: any, formData: FormData, text: string) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
          'Content-Type': 'multipart/form-data',
          accept: '*/*'
        }
      });
      const response = await instance.post(url, formData);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 2000
      })

      return response;
    } catch (error) {
      console.log('RES ERROR: ', error.response);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }
  }

  async axios_formdata_put(url: any, formData: FormData, text: string) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token_hrgis'),
          'Content-Type': 'multipart/form-data',
          accept: '*/*'
        }
      });
      const response = await instance.put(url, formData);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 2000
      })

      return response;
    } catch (error) {
      console.log('RES ERROR: ', error.response);
      Swal.fire({
        icon: 'error',
        title: error.response.status,
        text: error.response.data
      })
    }
  }

  async exportExcel(params: any, namefile: string = "", url: any) {
    try {
      const instance = axios.create({
        baseURL: environment.API_URL,
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      const response = await instance.post(url, params);

      const today = new Date();
      const dd = ("0" + today.getDate()).slice(-2);
      const mm = ("0" + (today.getMonth() + 1)).slice(-2);
      const yyyy = today.getFullYear();
      const hh = today.getHours();
      const mn = today.getMinutes();
      const sc = today.getMilliseconds();

      if (window.navigator.msSaveBlob) //IE & Edge
      { //msSaveBlob only available for IE & Edge
        console.log("IE & Edge")
        const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
        window.navigator.msSaveBlob(blob, namefile + `-` + yyyy + mm + dd + hh + mn + sc + `.xlsx`);
      }
      else //Chrome & FF
      {
        console.log("Chrome")
        const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', namefile + `-` + yyyy + mm + dd + hh + mn + sc + `.xlsx`);
        document.body.appendChild(link);
        link.click();
      }
    } catch (error) {
      console.log('RES ERROR: ', error.response);
    }
  }

  service_jwt() {
    var token = localStorage.getItem('token_hrgis');
    var decoded = jwt_decode(token);

    // console.log('decoded: ',decoded);
    return decoded;
  }

}