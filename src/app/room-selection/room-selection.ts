import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common'
import { State } from '../service/state';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-room-selection',
  imports: [CurrencyPipe],
  templateUrl: './room-selection.html',
  styleUrl: './room-selection.scss',
})
export class RoomSelection {

  constructor(public booking: State, private router: Router, private location: Location, private stateService: State) { }

  navigate() {
    const data = JSON.parse(localStorage.getItem('primaryUser') || '{}');
    const email = data.email;
    const phone = data.phone;

    this.stateService.emailSet.update(list => new Set([...list, email]));
    this.stateService.phoneSet.update(list => new Set([...list, phone]));

    this.router.navigate(['/register'])
  }
  goBack() {
    this.location.back();
  }

}
