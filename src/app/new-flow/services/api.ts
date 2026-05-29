import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);

  saveDynamics(payload: FormData) {
    return this.http.post(`${environment.apiBaseUrl}v2/admin/create-event`, payload);
  }

  updateDynamics(id: number, payload: FormData) {
    return this.http.put(`${environment.apiBaseUrl}v2/admin/update-event/${id}`, payload);
  }
}












// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import { environment } from '../../../environments/environment';
// import { of } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class Api {
//   private http = inject(HttpClient);

//   saveDynamics(payload: FormData) {
//     return of({ status: true, message: 'Data saved successfully' });
//     // return this.http.post(`${environment.apiBaseUrl}admin/dynamics`, payload);
//   }

//   updateDynamics(_id: number, _payload: FormData) {
//     return of({ status: true, message: 'Data updated successfully' });
//     // return this.http.put(`${environment.apiBaseUrl}admin/dynamics/${id}`, payload);
//   }
// }
