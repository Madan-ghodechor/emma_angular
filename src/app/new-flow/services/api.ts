import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);

  saveDynamics(payload: FormData) {
    return of({ status: true, message: 'Data saved successfully' });
    // return this.http.post(`${environment.apiBaseUrl}admin/dynamics`, payload);
  }

  updateDynamics(_id: number, _payload: FormData) {
    return of({ status: true, message: 'Data updated successfully' });
    // return this.http.put(`${environment.apiBaseUrl}admin/dynamics/${id}`, payload);
  }
}
