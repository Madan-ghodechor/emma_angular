import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Api {

  http: HttpClient = inject(HttpClient);
  constructor() { }

  getCompanies() {
    return this.http.get(`${environment.apiBaseUrl}companies`);
  }
  getUsers(){
    return this.http.get(`${environment.apiBaseUrl}users`)
  }

  /* ---------------------  Payment Methods  ----------------------- */
  createOrder(amount: number) {
    return this.http.post(`${environment.apiBaseUrl}payment/order`, { amount });
  }
  verifyAmount(data: any) {
    return this.http.post(`${environment.apiBaseUrl}verify`, { userData: data });
  }

  verifyPayment(data: any) {
    return of({ status: 'success' });
  }

  recordPaymentSuccess(data: any) {
    return this.http.post(`${environment.apiBaseUrl}record-payment`, data);
  }



  /* ---------------------  Booking Log Methods  ----------------------- */
  createBookingLog(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}attempt`, payload)
  }


}
