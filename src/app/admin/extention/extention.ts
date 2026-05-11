// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-extention',
//   imports: [],
//   templateUrl: './extention.html',
//   styleUrl: './extention.scss',
// })
// export class Extention {

// }


import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DAY_MONTH_YEAR_FORMATS } from '../../dates/date-formats';
import moment, { Moment } from 'moment';
import { Api } from '../services/api';

type ExtendType = 'stay_extend' | 'room_upgrade' | 'both';
type RoomType = 'single' | 'double' | 'triple';

@Component({
  selector: 'app-extension',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DAY_MONTH_YEAR_FORMATS }
  ],
  templateUrl: './extension.html',
  styleUrl: './extension.scss'
})
export class Extension {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  private api = inject(Api);

  readonly singlePrice = 9500;
  readonly doublePrice = 10000;
  readonly triplePrice = 12750;
  readonly minCheckInDate = moment('2026-03-23');
  readonly maxCheckInDate = moment('2026-03-26');
  readonly minCheckOutDate = moment('2026-03-24');
  readonly maxCheckOutDate = moment('2026-03-27');

  userdata = history.state?.userdata ?? null;

  extensionForm = this.fb.group({
    passcode: ['', [Validators.required]],
    whatToExtend: ['stay_extend' as ExtendType, [Validators.required]],
    roomType: ['' as RoomType | '', []],
    checkIn: [null as Moment | null],
    checkOut: [null as Moment | null]
  });

  roomOptions: RoomType[] = [];
  currentStayNights = 0;
  updatedStayNights = 0;
  currentTotalAmount = 0;
  updatedTotalAmount = 0;
  extraPayableAmount = 0;
  isSubmitting = false;

  ngOnInit(): void {
    const previousRoomType = (this.userdata?.roomType || '').toLowerCase() as RoomType;
    this.roomOptions = this.getAllowedRoomUpgrade(previousRoomType);

    const currentCheckIn = this.toMoment(this.userdata?.checkIn);
    const currentCheckOut = this.toMoment(this.userdata?.checkOut);

    this.extensionForm.patchValue({
      checkIn: currentCheckIn,
      checkOut: currentCheckOut
    });

    this.onWhatToExtendChange(this.extensionForm.value.whatToExtend as ExtendType);
    this.refreshPricingSummary();

    this.extensionForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshPricingSummary());
  }

  onWhatToExtendChange(value: ExtendType): void {
    const roomCtrl = this.extensionForm.get('roomType');
    const checkInCtrl = this.extensionForm.get('checkIn');
    const checkOutCtrl = this.extensionForm.get('checkOut');
    const originalCheckIn = this.toMoment(this.userdata?.checkIn);
    const originalCheckOut = this.toMoment(this.userdata?.checkOut);

    roomCtrl?.setValue('');
    checkInCtrl?.setValue(originalCheckIn);
    checkOutCtrl?.setValue(originalCheckOut);

    roomCtrl?.clearValidators();
    checkInCtrl?.setValidators([
      this.momentDateRangeValidator(this.minCheckInDate, this.maxCheckInDate)
    ]);
    checkOutCtrl?.setValidators([
      this.momentDateRangeValidator(this.minCheckOutDate, this.maxCheckOutDate)
    ]);

    if (value === 'room_upgrade') {
      roomCtrl?.setValidators([Validators.required]);
    } else if (value === 'stay_extend') {
      checkOutCtrl?.setValidators([
        Validators.required,
        this.momentDateRangeValidator(this.minCheckOutDate, this.maxCheckOutDate)
      ]);
    } else {
      roomCtrl?.setValidators([Validators.required]);
      checkInCtrl?.setValidators([
        Validators.required,
        this.momentDateRangeValidator(this.minCheckInDate, this.maxCheckInDate)
      ]);
      checkOutCtrl?.setValidators([
        Validators.required,
        this.momentDateRangeValidator(this.minCheckOutDate, this.maxCheckOutDate)
      ]);
    }

    roomCtrl?.updateValueAndValidity();
    checkInCtrl?.updateValueAndValidity();
    checkOutCtrl?.updateValueAndValidity();
  }

  showDateFields(): boolean {
    const type = this.extensionForm.value.whatToExtend as ExtendType;
    return type === 'stay_extend' || type === 'both';
  }

  showRoomUpgradeField(): boolean {
    const type = this.extensionForm.value.whatToExtend as ExtendType;
    return type === 'room_upgrade' || type === 'both';
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.extensionForm.invalid) {
      this.extensionForm.markAllAsTouched();
      return;
    }

    if (this.extensionForm.getRawValue().passcode != 'mg6232') {
      window.alert('passcode incorrect');
    } else {
      const normalizedExtension = {
        ...this.extensionForm.getRawValue(),
        checkIn: this.toUtcMidnightIso(this.extensionForm.getRawValue().checkIn),
        checkOut: this.toUtcMidnightIso(this.extensionForm.getRawValue().checkOut)
      };

      const payload = {
        booking: this.userdata,
        extension: normalizedExtension,
        pricing: {
          currentStayNights: this.currentStayNights,
          updatedStayNights: this.updatedStayNights,
          currentTotalAmount: this.currentTotalAmount,
          updatedTotalAmount: this.updatedTotalAmount,
          extraPayableAmount: this.extraPayableAmount
        }
      };

      this.isSubmitting = true;
      this.api.submitExtension(payload).subscribe({
        next: (res: any) => {
          console.log('Extension payload:', JSON.stringify(res));
          this.snackBar.open(res?.message || 'Extension details captured successfully', 'Close', {
            duration: 3000
          });
          setTimeout(() => {
            this.isSubmitting = false;
          });
        },
        error: () => {
          this.snackBar.open('Failed to submit extension details', 'Close', {
            duration: 3000
          });
          setTimeout(() => {
            this.isSubmitting = false;
          });
        }
      });
    }

  }

  formatWithMoment(value: string | null | undefined): string {
    if (!value) return '-';
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '-';
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-IN');
  }

  private getAllowedRoomUpgrade(current: RoomType): RoomType[] {
    if (current === 'single') return ['double', 'triple'];
    if (current === 'double') return ['triple'];
    return [];
  }

  private refreshPricingSummary(): void {
    const currentRoomType = (this.userdata?.roomType || '').toLowerCase() as RoomType;
    const selectedType = (this.extensionForm.value.roomType || currentRoomType) as RoomType;
    const currentCheckIn = this.toMoment(this.userdata?.checkIn);
    const currentCheckOut = this.toMoment(this.userdata?.checkOut);
    const selectedCheckIn = this.extensionForm.value.checkIn ?? currentCheckIn;
    const selectedCheckOut = this.extensionForm.value.checkOut ?? currentCheckOut;

    this.currentStayNights = this.calculateNights(currentCheckIn, currentCheckOut);
    this.updatedStayNights = this.calculateNights(selectedCheckIn, selectedCheckOut);

    const currentRoomPrice = this.getRoomPrice(currentRoomType);
    const updatedRoomPrice = this.getRoomPrice(selectedType);

    this.currentTotalAmount = this.currentStayNights * currentRoomPrice;
    this.updatedTotalAmount = this.updatedStayNights * updatedRoomPrice;
    this.extraPayableAmount = Math.max(0, this.updatedTotalAmount - this.currentTotalAmount);
  }

  private getRoomPrice(roomType: RoomType | ''): number {
    if (roomType === 'single') return this.singlePrice;
    if (roomType === 'double') return this.doublePrice;
    if (roomType === 'triple') return this.triplePrice;
    return 0;
  }

  private calculateNights(checkIn: Moment | null, checkOut: Moment | null): number {
    if (!checkIn || !checkOut) return 0;

    const startUTC = Date.UTC(
      checkIn.year(),
      checkIn.month(),
      checkIn.date()
    );

    const endUTC = Date.UTC(
      checkOut.year(),
      checkOut.month(),
      checkOut.date()
    );

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    return Math.max(0, (endUTC - startUTC) / MS_PER_DAY);
  }

  private momentDateRangeValidator(min: Moment, max: Moment): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as Moment | null;
      if (!value) return null;

      if (!moment.isMoment(value) || !value.isValid()) {
        return { invalidDate: true };
      }

      if (value.isBefore(min, 'day')) {
        return { minDate: true };
      }

      if (value.isAfter(max, 'day')) {
        return { maxDate: true };
      }

      return null;
    };
  }

  private toMoment(value: string | null | undefined): Moment | null {
    if (!value) return null;
    const parsed = moment(value);
    return parsed.isValid() ? parsed : null;
  }

  private toUtcMidnightIso(value: Moment | null | undefined): string | null {
    if (!value || !moment.isMoment(value) || !value.isValid()) {
      return null;
    }

    return moment.utc({
      year: value.year(),
      month: value.month(),
      day: value.date()
    }).startOf('day').toISOString();
  }
}