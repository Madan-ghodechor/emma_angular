import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil, map } from 'rxjs';

import { Api } from '../service/api';
import { State } from '../service/state';
import { LoggerService } from '../service/logger.service';
import { SharedFiltering } from '../service/shared-filtering';


import intlTelInput from 'intl-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { EmmaSuccessModal } from './emma-success-modal';
import { environment } from '../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-emma-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
  ],
  templateUrl: './emma-registration.html',
  styleUrl: './emma-registration.scss',
})
export class EmmaRegistration implements OnInit, OnDestroy {

  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;

  iti: any;
  form!: FormGroup;
  isEmma = signal(true);
  isSubmitting = signal(false);
  private destroy$ = new Subject<void>();

  gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  get fee() {
    return this.isEmma() ? 15000 : 18000;
  }

  get gstAmount() {
    return Math.round(this.fee * (environment.gst - 1));
  }

  get totalAmount() {
    return this.fee + this.gstAmount;
  }

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router,
    private state: State,
    private logger: LoggerService,
    public sharedFiltering: SharedFiltering,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      memberType: ['emma'],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: ['', [Validators.required, Validators.minLength(2)]],
      gst: ['', [Validators.pattern(this.gstPattern)]],
    });
  }

//   ngAfterViewInit() {
//     this.iti = intlTelInput(this.phoneInput.nativeElement, {
//       initialCountry: 'in',
//       separateDialCode: true,
//       allowDropdown: true,
//       countrySearch: false,
//     });

//     this.phoneInput.nativeElement.addEventListener('countrychange', () => {
//       this.form.patchValue({ phone: '' });
//     });
//   }

syncPhoneToForm(): void {
  if (!this.iti) return;
  if (this.iti.isValidNumber()) {
    this.form.patchValue({ phone: this.iti.getNumber() });
  } else {
    this.form.patchValue({ phone: '' });
  }
}

ngAfterViewInit() {
  const inputEl = this.phoneInput.nativeElement;

  this.iti = intlTelInput(inputEl, {
    initialCountry: 'in',
    separateDialCode: true,
    allowDropdown: true,
    countrySearch: false,
    // ✅ ADD THIS
    loadUtils: () => import('intl-tel-input/utils'),
  });

  inputEl.addEventListener(
    'countrychange',
    this.onCountryChange.bind(this)
  );
}

onCountryChange(): void {
  this.form.patchValue({ phone: '' });
  this.syncPhoneToForm();
}

getPhoneFullNumber(): string | null {
  if (!this.iti.isValidNumber()) return null;
  const phoneNumber = parsePhoneNumberFromString(this.iti.getNumber());
  if (!phoneNumber) return null;
  return phoneNumber.formatInternational();
}

  selectMemberType(type: 'emma' | 'non') {
    this.isEmma.set(type === 'emma');
    this.form.patchValue({ memberType: type });
  }

//   getPhoneFullNumber(): string | null {
//     if (!this.iti?.isValidNumber()) return null;
//     return this.iti.getNumber();
//   }

  save(): void {

    console.log('form valid:', this.form.valid);
  console.log('iti valid:', this.iti.isValidNumber());
  console.log('iti number:', this.iti.getNumber());
  console.log('phone input value:', this.phoneInput.nativeElement.value);
  console.log('form phone value:', this.form.get('phone')?.value);
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (!this.iti || !this.iti.isValidNumber()) {
  this.form.get('phone')?.setErrors({ invalid: true });
  this.form.get('phone')?.markAsTouched();
  return;
}

const country = this.iti.getSelectedCountryData();
const nationalPhone = this.phoneInput.nativeElement.value.replace(/\s+/g, '');
const fullPhone = '+' + country.dialCode + nationalPhone;

  this.isSubmitting.set(true);

  const payload = {
    ...this.form.value,
    phone: fullPhone,
    fee: this.fee,
    gstAmount: this.gstAmount,
    totalAmount: this.totalAmount,
  };

  this.api.createEmmaRegistration(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        const registrationData = res?.data || {};
        this.openSuccessModal({
          ...payload,
          id: registrationData.id,
          registrationId: registrationData.id,
          orderId: registrationData.orderId,
        }, res);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const message = err?.error?.message || '';

        if (err?.status === 409 && message.includes('email')) {
          this.form.get('email')?.setErrors({ duplicate: true });
          this.form.get('email')?.markAsTouched();
        }

        if (err?.status === 409 && message.includes('phone')) {
          this.form.get('phone')?.setErrors({ duplicate: true });
          this.form.get('phone')?.markAsTouched();
        }

        this.logger.log('Registration error', err);
      }
    });
}

  openSuccessModal(payload: any, res: any) {
    const dialogRef = this.dialog.open(EmmaSuccessModal, {
      width: '480px',
      disableClose: true,
      data: {
        payload,
        fee: this.fee,
        gstAmount: this.gstAmount,
        totalAmount: this.totalAmount,
        isEmma: this.isEmma()
      }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'book') {
        sessionStorage.setItem('primaryUser', JSON.stringify({
          firstName: payload.firstName,
          lastName: payload.lastName,
          organisation: payload.company,
          email: payload.email,
          phone: payload.phone,
          gst: payload.gst,
          is_primary_user: true,
          primary_user_email: payload.email,
        }));
        this.router.navigate(['/members-selection']);
      }

      if (result === 'pay') {
        this.openRazorpay(payload);
      }
    });
  }

  openRazorpay(payload: any) {
    this.api.createOrder(this.totalAmount)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        const order = res?.data;

        if (!order?.id) {
          this.logger.error('Invalid Razorpay order response', res);
          return;
        }

        const options = {
          key: environment.razorpayKey,
          amount: order.amount,
          currency: 'INR',
          name: 'EMMA Registration',
          description: `${this.isEmma() ? 'EMMA Member' : 'Non-EMMA Member'} Registration Fee`,
          order_id: order.id,
          prefill: {
            name: `${payload.firstName} ${payload.lastName}`,
            email: payload.email,
            contact: payload.phone,
          },
          theme: { color: '#6366f1' },
          handler: (response: any) => {
            this.api.recordPaymentSuccess({
              ...response,
              userData: payload,
            }).subscribe(() => {
              this.router.navigate(['/payment-success', response.razorpay_order_id]);
            });
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', (response: any) => {
          this.api.recordFailedPayment(response).subscribe();
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
