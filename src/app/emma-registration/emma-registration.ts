import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil, map, startWith } from 'rxjs';

import { Api } from '../service/api';
import { State } from '../service/state';
import { LoggerService } from '../service/logger.service';
import { SharedFiltering } from '../service/shared-filtering';


import intlTelInput from 'intl-tel-input';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { EmmaSuccessModal } from './emma-success-modal';
import { EmmaConfirmModal } from './emma-confirmation-modal';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

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
    AsyncPipe,
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
  filteredOptions!: Observable<any[]>;

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
      memberType: ['eema'],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      company: ['', [Validators.required, Validators.minLength(2)]],
      gst: ['', [Validators.pattern(this.gstPattern)]],
    });

    this.api.getCompanies().pipe(map((res: any) =>
      res.data.map((c: any) => ({ id: c._id, name: c.name, isEEMAMember: c.isEEMAMember }))
    )).subscribe(companies => this.sharedFiltering.companies = companies);

    this.filteredOptions = this.form.get('company')!.valueChanges.pipe(
      startWith(''),
      map(value => this.sharedFiltering.filterCompanies(value))
    );
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

  selectMemberType(type: 'eema' | 'non') {
    this.isEmma.set(type === 'eema');
    this.form.patchValue({ memberType: type });
  }

  displayCompany(company: any): string {
    return company ? (typeof company === 'string' ? company : company.name) : '';
  }

  setGst(event: any): void {
    const company = event.option.value;
    this.form.get('gst')?.setValue(company.gst ?? '');
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

    const selectedCompany = this.form.value.company;

    if (this.isEmma() && selectedCompany?.isEEMAMember !== 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid EEMA Member',
        text: `"${selectedCompany?.name ?? selectedCompany}" is not a registered EEMA member company. Please select a valid EEMA member company or register as a Non-EEMA Member.`,
        confirmButtonColor: '#4f46e5',
      });
      return;
    }

    const country = this.iti.getSelectedCountryData();
    const nationalPhone = this.phoneInput.nativeElement.value.replace(/\s+/g, '');
    const fullPhone = '+' + country.dialCode + nationalPhone;

    this.isSubmitting.set(true);

    const companyValue = this.form.value.company;
    const payload = {
      ...this.form.value,
      company: companyValue?.name ?? companyValue,
      phone: fullPhone,
      fee: this.fee,
      gstAmount: this.gstAmount,
      totalAmount: this.totalAmount,
    };

    this.api.validateEmmaRegistration(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.openSuccessModal(payload);
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

  openSuccessModal(payload: any) {
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
        const sessionData = {
          payload,
          fee: this.fee,
          gstAmount: this.gstAmount,
          totalAmount: this.totalAmount,
          isEmma: this.isEmma()
        }
        sessionStorage.setItem('sessionfrom', JSON.stringify(sessionData));
        this.router.navigate(['/members-selection']);
      }

      if (result === 'pay') {
        this.openConfirmationModal(payload);
      }
    });
  }
  openConfirmationModal(payload: any) {
    const dialogRef = this.dialog.open(EmmaConfirmModal, {
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
        const sessionData = {
          payload,
          fee: this.fee,
          gstAmount: this.gstAmount,
          totalAmount: this.totalAmount,
          isEmma: this.isEmma()
        }
        sessionStorage.setItem('sessionfrom', JSON.stringify(sessionData));
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
            this.api.recordEmmaRegistrationPaymentSuccess({
              registrationData: payload,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              baseFee: payload.fee,
              gstAmount: payload.gstAmount,
              totalAmount: payload.totalAmount,
              amount: payload.totalAmount,
            }).subscribe((res: any) => {
              sessionStorage.setItem('emmaRegSuccess', JSON.stringify(res.data));
              this.router.navigate(['/emma-reg-success']);
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
