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
import { ReactiveFormsModule } from '@angular/forms';
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

import { DuplicateDialogComponent } from './duplicate-details.component'

import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { LoggerService } from '../service/logger.service';
import { ActivatedRoute } from '@angular/router';


/* ---------------- Types ---------------- */

type RoomType = 'single' | 'double' /* | 'triple' */;

interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  phone?: string;
  gst?: string;
  is_primary_user: boolean;
  primary_user_email: string;
}

export interface Room {
  roomId: string;
  roomtype: RoomType;
  checkIn: string | null;
  checkOut: string | null;
  attendees: Attendee[];
}

interface SessionFrom {
  totalAmount?: number;
}

/* ---------------- Component ---------------- */

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [
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
    MatSnackBarModule
  ],
  templateUrl: './users-form.html',
  styleUrl: './users-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DAY_MONTH_YEAR_FORMATS }
  ]
})

export class UsersForm {

  paymentInProgress = true;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: BeforeUnloadEvent) {
    if (this.paymentInProgress) {
      event.preventDefault();
      event.returnValue = 'Payment is in progress. Do not refresh.';
    }
  }


  /* ---------------- Signals ---------------- */

  activeRoomType = signal<RoomType>('single');
  expandedRoomId = signal<any | null>(null);
  rooms = signal<Room[]>([]);
  sessionfrom = signal<SessionFrom | null>(null);

  /* ---------------- Capacity ---------------- */

  public readonly roomCapacity: Record<RoomType, number> = {
    single: 1,
    double: 2,
    // triple: 3
  };



  constructor(
    public booking: State,
    private dialog: MatDialog,
    private api: Api,
    private _snackBar: MatSnackBar,
    private router: Router,
    private logger: LoggerService,
    private route: ActivatedRoute
  ) {

    effect(() => {
      const single = this.booking.singleRooms();
      const double = this.booking.doubleRooms();
      // const triple = this.booking.tripleRooms();

      this.generateRooms(single, double);
      this.calculateRoomNights(this.rooms());



      const rooms = this.rooms() as Room[];
      if (!rooms.length) return;

      // Open first room if nothing is open
      if (!this.expandedRoomId()) {
        this.expandedRoomId.set(rooms[0].roomId);
      }

    });

  }
  ngAfterViewInit() {

    if (!sessionStorage.getItem('primaryUser'))
      this.router.navigate(['/'])

    this.sessionfrom.set(JSON.parse(sessionStorage.getItem('sessionfrom') || '{}'));

    const roomsProceed: any = sessionStorage.getItem('rooms');
    if (roomsProceed)
      this.rooms.set(JSON.parse(roomsProceed))

    const rooms = this.rooms() as Room[];

    this.route.queryParams.subscribe(p => {
      this.setCheckIn(rooms[0].roomId, p['checkIn'])
      this.setCheckOut(rooms[0].roomId, p['checkOut'])
    });

    if (rooms.length == 1 || rooms.length == 2) {
      this.activeRoomType.set(rooms[0].roomtype);
    }

    if (rooms.length == 1) {
      if (!this.rooms()[0].attendees.some(a => a.is_primary_user === true)) {
        this.addPrimaryUser(rooms[0], 'default')
      }
    }

  }

  readonly totalPrice = computed(() =>
  ((this.booking.singlePrice() * this.singleRoomsNights()) +
    (this.booking.doublePrice() * this.doubleRoomsNights()) 
    // +(this.booking.triplePrice() * this.tripleRoomsNights())
  )
  );

  readonly gstAmount = computed(() => this.totalPrice() * (environment.gst - 1));

  readonly registrationAmount = computed(() =>
    this.sessionfrom()?.totalAmount || 0
  );

  readonly withGST = computed(() =>
    (this.totalPrice() * environment.gst) + this.registrationAmount()
  );


  /* ---------------- Room generation (SAFE) ---------------- */

  private generateRooms(
    single: number,
    double: number,
    // triple: number
  ): void {
    const previous = untracked(() => this.rooms());
    const next: Room[] = [];

    const create = (type: RoomType, count: number) => {
      for (let i = 1; i <= count; i++) {
        const roomId = `${type}-${i}`;
        const existing = previous.find(r => r.roomId === roomId);

        next.push(
          existing ?? {
            roomId,
            roomtype: type,
            checkIn: null,
            checkOut: null,
            attendees: []
          }
        );
      }
    };

    create('single', single);
    create('double', double);
    // create('triple', triple);

    this.rooms.set(next);
  }

  /* ---------------- UI helpers ---------------- */

  openSnackBar() {
    this._snackBar.open('Guest added into room', '', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  open(roomId: string): void {
    this.expandedRoomId.set(roomId);
  }

  close(): void {
    this.expandedRoomId.set(null);
  }

  isOpen(roomId: string): boolean {
    return this.expandedRoomId() === roomId;
  }
  onRoomTypeChange(type: 'single' | 'double' /* | 'triple' */) {
    this.activeRoomType.set(type);

    const rooms = this.filteredRooms();

    const roomToOpen = this.getRoomToAutoOpen(rooms);

    this.expandedRoomId.set(roomToOpen?.roomId ?? null);
  }
  getRoomToAutoOpen(rooms: Room[]): Room | null {
    if (!rooms.length) return null;

    const incompleteRoom = rooms.find(room => !this.isRoomFull(room));

    return incompleteRoom ?? rooms[0];
  }

  changeTabsAndExpansion(roomObj: any) {
    const room = Array.isArray(roomObj) ? roomObj[0] : roomObj;
    this.logger.log(room)

    this.openSnackBar()

    const [type, currentRoomNumber] = room.roomId.split('-');

    const totalRooms = this.rooms().filter(res => (res.roomtype == room.roomtype))
    const Room = this.rooms().filter(res => (res.roomId == room.roomId))


    // Next Expansion
    const roomCapacity = (Room[0].roomtype == 'single' ? 1 : Room[0].roomtype == 'double' ? 2 : 3);
    const guestInRoom = Room[0].attendees.length;
    const isLastRoom = totalRooms.length == currentRoomNumber ? true : false

    // this.logger.log('Current Room Capacity : ', roomCapacity);
    // this.logger.log('Guests In Room : ', guestInRoom);
    // this.logger.log('Current Room Number : ', currentRoomNumber)

    if (roomCapacity == guestInRoom) {
      const expansion = `${type}-${(Number(currentRoomNumber) + 1)}`
      this.expandedRoomId.set(expansion);

      if (isLastRoom) {
        const ro = Room[0].roomtype == 'single' ? 'double' : 'triple';
        const room_check = this.rooms().some(res => res.roomtype === ro);

        if (room_check) {
          (Room[0].roomtype == 'single') ? this.onRoomTypeChange('double') : ''
          // (Room[0].roomtype == 'double') ? this.onRoomTypeChange('triple') : ''
        }
      }
    } else {
      setTimeout(() => {
        this.openDialog(Room[0])
      }, 600);
    }


  }


  /* ---------------- Dates ---------------- */
  setCheckIn(roomId: string, date: Date | null): void {
    if (!date) return;

    const checkIn = moment(date).startOf('day');
    const minCheckout = checkIn.clone().add(1, 'day');

    this.updateRoom(roomId, r => ({
      ...r,
      checkIn: checkIn.format('YYYY-MM-DD'),
      checkOut:
        r.checkOut && moment(r.checkOut).isBefore(minCheckout)
          ? null
          : r.checkOut
    }));
  }
  setCheckOut(roomId: string, date: Date | null): void {
    if (!date) return;

    this.updateRoom(roomId, r => ({
      ...r,
      checkOut: moment(date).startOf('day').format('YYYY-MM-DD')
    }));
  }


  /* ---------------- Attendees ---------------- */
  addPrimaryUser(room: any, ini = 'add'): void {
    const primaryUser = JSON.parse(sessionStorage.getItem('primaryUser') || '{}');
    // this.logger.log(primaryUser);
    this.addAttendee(
      room,
      {
        firstName: primaryUser.firstName,
        lastName: primaryUser.lastName,
        email: primaryUser.email,
        organisation: primaryUser.organisation,
        phone: primaryUser.phone,
        gst: primaryUser.gst,
        is_primary_user: primaryUser.is_primary_user,
        primary_user_email: primaryUser.primary_user_email
      },
      ini
    );

  }

  addAttendee(
    Atroom: any,
    attendee: Omit<Attendee, 'id'>,
    ini = 'add'
  ): void {

    const primaryUser = JSON.parse(sessionStorage.getItem('primaryUser') || '{}');

    const isPrimaryUser = attendee.is_primary_user === true ? true : false;

    this.rooms.update(rooms =>
      rooms.map(room => {
        if (room.roomId !== Atroom.roomId || this.isRoomFull(room)) {
          return room;
        }
        return {
          ...room,
          attendees: [
            ...room.attendees,
            {
              id: this.booking.generateUUID(),
              ...attendee,
              is_primary_user: isPrimaryUser,
              primary_user_email: primaryUser.email
            }
          ]
        };
      })
    );

    if (ini == 'add') {
      this.changeTabsAndExpansion(Atroom)
    }



    const singleroom = this.booking.singleRooms();
    const doubleroom = this.booking.doubleRooms();
    // const tripleroom = this.booking.tripleRooms();

    const bkgRefInLocal = localStorage.getItem('bkgRef');

    const logPayload = {
      "bulkRefId": bkgRefInLocal,
      "stage": 3,
      singleroom,
      doubleroom,
      // tripleroom,
      "userdata": this.rooms()
    }
    this.api.createBookingLog(logPayload).subscribe();
  }

  updateAttendee(
    roomId: string,
    attendeeId: string,
    data: Partial<Attendee>
  ): void {
    this.rooms.update(rooms =>
      rooms.map(room =>
        room.roomId === roomId
          ? {
            ...room,
            attendees: room.attendees.map(a =>
              a.id === attendeeId ? { ...a, ...data } : a
            )
          }
          : room
      )
    );
  }

  deleteAttendee(roomId: string, attendee: Attendee): void {

    if (!attendee.is_primary_user) {
      this.logger.log(attendee)

      this.booking.emailSet.update(list => {
        const newSet = new Set(list);
        newSet.delete(attendee.email);
        return newSet;
      });

      this.booking.phoneSet.update(list => {
        const newSet = new Set(list);
        if (attendee?.phone) {
          newSet.delete(attendee.phone);
        }
        return newSet;
      });
    }

    this.rooms.update(rooms =>
      rooms.map(room =>
        room.roomId === roomId
          ? {
            ...room,
            attendees: room.attendees.filter(a => a.id !== attendee.id)
          }
          : room
      )
    );
  }

  /* ---------------- Dialog ---------------- */
  openDialog(room: any, attendee?: Attendee): void {

    const emails__ = new Set<string>();
    const phones__ = new Set<string>();

    // console.log(this.booking.emailSet())

    this.rooms()[0].attendees.forEach(a => {
      if (a?.email) emails__.add(a.email);
      if (a?.phone) phones__.add(a.phone);
    });

    this.booking.emailSet.set(emails__);
    this.booking.phoneSet.set(phones__);

    this.api.getUsers()
      .pipe(
        map((res: any) =>
          res.data.map((user: any) => ({
            phone: user.phone,
            email: user.email
          }))
        )
      )
      .subscribe({
        next: result => {
          for (let da of result) {
            this.booking.emailSet.update(list => new Set([...list, da?.email]));
            this.booking.phoneSet.update(list => new Set([...list, da?.phone]));
          }
        }
      });


    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: '500px',
      // height: "900px",
      data: {
        roomId: room, attendee, primaryAdded: !this.hasPrimaryUser()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result === 'triggerButton') {
        this.addPrimaryUser(room);
      } else {
        attendee ? this.updateAttendee(room, attendee.id, result) : this.addAttendee(room, result);
      }
    });
  }
  openDuplicateDialog(duplicate: any): void {
    const dialogRef = this.dialog.open(DuplicateDialogComponent, {
      width: '500px',
      data: duplicate
    });

  }


  /* ---------------- Computed ---------------- */
  filteredRooms = computed(() => {
    const rooms = this.rooms() as Room[];
    const activeType = this.activeRoomType();

    if (rooms.length === 1) {
      return rooms;
      this.logger.log(rooms);
    }

    return rooms.filter(r => r.roomtype === activeType);
  });


  isRoomFull(room: Room): boolean {
    return room.attendees.length >= this.roomCapacity[room.roomtype];
  }

  isRoomCompleted(room: Room): boolean {
    return (
      !!room.checkIn &&
      !!room.checkOut &&
      room.attendees.length === this.roomCapacity[room.roomtype]
    );
  }


  hasPrimaryUser = computed(() =>
    this.rooms().some(room =>
      room.attendees.some(attendee => attendee.is_primary_user === true)
    )
  );
  isReadyToPayment = computed(() =>
    this.rooms().every(room => this.isRoomCompleted(room)) && this.hasPrimaryUser()
  );


  /* ---------------- Internal helper ---------------- */

  private updateRoom(
    roomId: string,
    updater: (room: Room) => Room
  ): void {
    this.rooms.update(rooms =>
      rooms.map(r => (r.roomId === roomId ? updater(r) : r))
    );
  }


  getMinCheckoutDate(checkIn: any | null): Date | null {
    if (!checkIn) return null;

    const minDate = new Date(checkIn);
    minDate.setDate(minDate.getDate() + 1); // +1 day
    return minDate;
  }





  /// Nights calculation
  singleRoomsNights = signal(1);
  doubleRoomsNights = signal(1);
  // tripleRoomsNights = signal(1);

  calculateRoomNights(rooms: Room[]) {
    this.singleRoomsNights.set(0);
    this.doubleRoomsNights.set(0);
    // this.tripleRoomsNights.set(0);

    for (const room of rooms) {
      if (!room.checkIn || !room.checkOut) continue;

      const nights = this.calculateNights(room.checkIn, room.checkOut);

      switch (room.roomtype) {
        case 'single':
          this.singleRoomsNights.update(n => n + nights);
          break;

        case 'double':
          this.doubleRoomsNights.update(n => n + nights);
          break;

        // case 'triple':
        //   this.tripleRoomsNights.update(n => n + nights);
        //   break;
      }
    }
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


  // ---------------- Saving Checks ---------------- //
  savingChecks(): void {
    const rooms = this.rooms();

    if (!rooms || rooms.length === 0) {
      this.logger.error('No rooms found');
      return;
    }

    this.api.verifyAmount(rooms).subscribe({
      next: (res: any) => {
        const amount = (res?.data?.totalAmount * environment.gst) + this.registrationAmount();
        const duplicate = res?.data?.duplicateDetails

        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
          this.logger.error('Invalid amount received:', res);
          return;
        }

        if (duplicate.length > 0) {
          this.openDuplicateDialog(duplicate)
        } else {

          const bkgRefInLocal = localStorage.getItem('bkgRef');

          const logPayload = {
            "bulkRefId": bkgRefInLocal,
            "stage": 4,
            "userdata": this.rooms()
          }

          this.api.createBookingLog(logPayload).subscribe((res: any) => {
            if (res.success) {
              const payload = {
                userData: rooms,
                bulkRefId: res.data.bulkRefId,
                logId: res.data.logId,
                amount
              }
              this.pay(amount, payload);
            }
          })
        }

      },
      error: (err) => {
        this.logger.error('Amount verification failed:', err);
      }
    });
  }





  pay(amount: number, payload: any) {

    this.api.createOrder(amount).pipe(map((order: any) => order.data)).subscribe({
      next: (order) => {
        if (!order?.id) {
          this.logger.error('Invalid order object', order);
          return;
        }
        this.openRazorpay(order, payload);
        this.logger.log('Order created', order);
      },
      error: err => this.logger.error('Order creation failed', err)
    });
  }

  openRazorpay(order: any, payload: any) {

    console.trace(payload)

    const options = {
      key: environment.razorpayKey,
      amount: order.amount,
      currency: 'INR',
      name: 'COTRAV',
      description: 'Payment',
      order_id: order.id,

      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: false
      },

      image: "https://play-lh.googleusercontent.com/-Gg0VKCGTW25SSQaFSh8ih6iKCbQs2myvuJCUzO1Rpd1lzeRpDmCFNpSzmddQ_QYgIo=w600-h300-pc0xffffff-pd",

      handler: (response: any) => {
        this.api.verifyPayment(response).subscribe({
          next: () => {
            this.logger.log(response)
            this.afterPaymentSuccess(response, payload)
          },
          error: () => {
            this.logger.log(response)
          }
        });
      },

      modal: {
        ondismiss: () => this.logger.log('Payment popup closed')
      },

      theme: {
        color: '#1976d2'
      }
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      this.logger.error('Payment failed', response.error);
      this.afterPaymentFailed(response.error, payload, order)
    });

    rzp.open();
  }

  afterPaymentSuccess(razorpayRes: any, prevData: any) {

    this.logger.log("after Payment success called")
    const whiteLabelRaw = localStorage.getItem('whiteLabel');
    const whiteLabel = whiteLabelRaw ? JSON.parse(whiteLabelRaw) : null;

    const payload = {
      ...razorpayRes,
      ...prevData,
      whiteLabel: whiteLabel
    }
    this.api.recordPaymentSuccess(payload).subscribe({
      next: (res: any) => {
        this.logger.log(res);
        this.router.navigate([`/payment-success/${res.data.bulkRefId}`]);
      },
      error: (err) => {
        this.logger.error('Payment record failed', err);
      }
    })
  }

  private paymentFailTimer: boolean = true;

  afterPaymentFailed(error: any, payload: any, order: any) {

    if (this.paymentFailTimer) {
      this.api.recordFailedPayment({ error, ...payload, order }).subscribe({
        next: (res: any) => this.logger.log(res)
      });
      this.paymentFailTimer = false;
    }

    setTimeout(() => {
      this.paymentFailTimer = true
    }, 20000);
  }

}
