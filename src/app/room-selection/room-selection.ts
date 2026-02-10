import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common'
import { State } from '../service/state';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Api } from '../service/api';

@Component({
  selector: 'app-room-selection',
  imports: [CurrencyPipe],
  templateUrl: './room-selection.html',
  styleUrl: './room-selection.scss',
})
export class RoomSelection {

  constructor(public booking: State, private router: Router, private location: Location, private stateService: State, private api: Api) {
  }

  navigate() {
    const bkgRefInLocal = localStorage.getItem('bkgRef');

    // if (bkgRefInLocal) {
      const singleroom = this.booking.singleRooms();
      const doubleroom = this.booking.doubleRooms();
      const tripleroom = this.booking.tripleRooms();

      const logPayload = {
        "bulkRefId": bkgRefInLocal,
        "stage": 3,
        singleroom,
        doubleroom,
        tripleroom,
        "userdata": [
        ]
      }
      this.api.createBookingLog(logPayload).subscribe();
    // }

    const data = JSON.parse(sessionStorage.getItem('primaryUser') || '{}');
    const email = data.email;
    const phone = data.phone;

    this.stateService.emailSet.update(list => new Set([...list, email]));
    this.stateService.phoneSet.update(list => new Set([...list, phone]));

    this.router.navigate(['/register'])
  }
  ngOnInit() {
    this.stateService.restore()
  }
  goBack() {
    this.location.back();
  }

}
