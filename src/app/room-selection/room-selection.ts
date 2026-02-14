import {
  Component,
  signal,
  effect,
  computed,
  ChangeDetectionStrategy,
  untracked,
  HostListener
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { State } from '../service/state';
import { FormDialogComponent } from '../shared-form/form-dialog.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { DAY_MONTH_YEAR_FORMATS } from '../dates/date-formats';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import { map } from 'rxjs/internal/operators/map';
import { Api } from '../service/api';


import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { LoggerService } from '../service/logger.service';

import { Location } from '@angular/common';

@Component({
  selector: 'app-room-selection',
  imports: [CurrencyPipe,
    CommonModule,
    CurrencyPipe,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIcon,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    FormsModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DAY_MONTH_YEAR_FORMATS }
  ],
  templateUrl: './room-selection.html',
  styleUrl: './room-selection.scss',
})
export class RoomSelection {

  constructor(public booking: State, private router: Router, private location: Location, private stateService: State, private api: Api) {
  }
  roomCount = signal(0)

  ngOnInit() {
    this.stateService.restore()
    this.api.getRoomCount().subscribe({
      next: (res: any) => {
        this.roomCount.set(environment.total_rooms - res.data.total_rooms)
      }
    })

    this.booking.decrease('single');
    this.booking.decrease('double');
    this.booking.decrease('triple');

    this.booking.increase('single');
    this.selected.set('single');

  }

  goBack() {
    this.location.back();
  }

  selected = signal<string | null>(null);
  nights = signal<number | 0>(0)

  checkIn = signal<Date | null>(null);
  checkOut = signal<Date | null>(null);


  select(type: 'single' | 'double' | 'triple') {
    this.selected.set(type);

    // First decrease all
    this.booking.decrease('single');
    this.booking.decrease('double');
    this.booking.decrease('triple');

    // Then increase only selected one
    this.booking.increase(type);
  }




  /* ---------------- Dates ---------------- */
  setCheckIn(date: Date | null) {
    if (!date) return;

    this.checkIn.set(date);

    // auto reset invalid checkout
    const out = this.checkOut();
    if (out && out <= date) {
      this.checkOut.set(null);
    }
  }

  setCheckOut(date: Date | null) {
    if (!date) return;
    this.checkOut.set(date);


    const toFormatCKI = moment(this.checkIn());
    // console.log(checkIn.format('DD/MM/YYYY'));
    const checkIn = toFormatCKI.format('YYYY/MM/DD');

    const toFormatCKO = moment(this.checkOut());
    // console.log(checkOut.format('DD/MM/YYYY'));
    const checkOut = toFormatCKO.format('YYYY/MM/DD');

    this.nights.set(this.calculateNights(checkIn, checkOut))
  }

  getMinCheckoutDate(checkIn: Date | null): Date | null {
    if (!checkIn) return null;

    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d;
  }



  navigate() {

    const toFormatCKI = moment(this.checkIn());
    // console.log(checkIn.format('DD/MM/YYYY'));
    const checkIn = toFormatCKI.format('YYYY/MM/DD');

    const toFormatCKO = moment(this.checkOut());
    // console.log(checkOut.format('DD/MM/YYYY'));
    const checkOut = toFormatCKO.format('YYYY/MM/DD');

    // this.calculateNights(checkIn, checkOut)

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

    // this.router.navigate([`/register?checkIn=${checkIn}&checkOut=${checkOut}`])
    this.router.navigate(['/register'], {
      queryParams: {
        checkIn: checkIn,
        checkOut: checkOut,
      }
    });
  }


  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // normalize to UTC date-only
    const startUTC = Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate()
    );

    const endUTC = Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate()
    );

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    return Math.max(0, (endUTC - startUTC) / MS_PER_DAY);
  }

}
