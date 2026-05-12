import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Api {
  http: HttpClient = inject(HttpClient);
  constructor() { }

  /* ---------------------  Login Methods  ----------------------- */
  getLoggedIn(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}admin/login`, payload);
  }


  /* ---------------------  Dashbord Methods  ----------------------- */
  getDashBord() {
    return this.http.get(`${environment.apiBaseUrl}admin/getDashboard`)
  }
  getPaymentById(id: string) {
    return this.http.get(`${environment.apiBaseUrl}admin/getPayment/${id}`)
  }

  submitExtension(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}admin/send-remaining-payment-mail`, { "data": payload })
  }

  generateVoucher(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}voucher`, payload, { responseType: 'blob' })
  }

  sendVoucher(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}admin/send-voucher`, payload)
  }

  saveCompany(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}white-label`, payload)
  }


}
