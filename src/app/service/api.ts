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
  getUsers() {
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
  recordFailedPayment(data: any) {
    return this.http.post(`${environment.apiBaseUrl}record-payment/failed`, data);
  }



  /* ---------------------  Booking Log Methods  ----------------------- */
  createBookingLog(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}attempt`, payload)
  }
  getBookingLogById(ID: string) {
    return this.http.get(`${environment.apiBaseUrl}attempt?refID=${ID}`)
  }


  getBookingRecord(ID: String) {
    return this.http.get(`${environment.apiBaseUrl}record-payment?refID=${ID}`)
  }



  /* ---------------------  Helpers API Methods  ----------------------- */

  generateVoucher(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}voucher`, payload, { responseType: 'blob' })
  }
  getRoomCount() {
    return this.http.get(`${environment.apiBaseUrl}rooms/count`)
  }


  /* ---------------------  White Label Methods  ----------------------- */
  getWhiteLabelCompanies() {
    return this.http.get(`${environment.apiBaseUrl}white-label`)
  }

  getWhiteLabel(id: string) {
    return this.http.post(`${environment.apiBaseUrl}white-label/getColors`, { id })
  }

  /* ---------------------  EMMA Registration Methods  ----------------------- */
  createEmmaRegistration(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}emma-registration`, payload);
  }

  validateEmmaRegistration(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}emma-registration/validate`, payload);
  }
 
  getEmmaRegistration(id: string, orderId: string) {
    return this.http.get(`${environment.apiBaseUrl}emma-registration?id=${id}&orderId=${orderId}`);
  }

  recordEmmaRegistrationPaymentSuccess(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}emma-registration/payment-success`, payload);
  }

}
