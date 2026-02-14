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

  /* ---------------------  Payment Methods  ----------------------- */
  getLoggedIn(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}admin/login`, payload);
  }

}
