import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { Api } from '../service/api';
import { Router } from '@angular/router';
import { SharedFiltering } from '../service/shared-filtering';

import { pendingDetailsComponent } from './pending_Details';

import intlTelInput from 'intl-tel-input';
import { parsePhoneNumber } from 'libphonenumber-js';
import { State } from '../service/state';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from '../service/logger.service';

import { ChangeDetectionStrategy, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

interface Company {
  _id: string;
  name: string;
  gst: string;
  address: string;
}

@Component({
  selector: 'app-primary-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AsyncPipe,
    MatAutocompleteModule,
    MatExpansionModule
  ],
  templateUrl: './primary-user.html',
  styleUrl: './primary-user.scss',
})

export class PrimaryUser implements OnInit {

  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;

  iti: any;

  readonly panelOpenState = signal(false);

  ngAfterViewInit() {
    this.iti = intlTelInput(this.phoneInput.nativeElement, {
      initialCountry: 'in',
      separateDialCode: true,
      allowDropdown: true,
      countrySearch: false
    });

    // 👇 LISTEN TO COUNTRY CHANGE
    this.phoneInput.nativeElement.addEventListener(
      'countrychange',
      this.onCountryChange.bind(this)
    );
  }
  onCountryChange(): void {
    const country = this.iti.getSelectedCountryData();
    this.userForm.patchValue({ phone: '' });
  }
  getPhoneData() {
    const number = this.phoneInput.nativeElement.value;

    if (!this.iti.isValidNumber()) {
      return null;
    }

    const phoneNumber = parsePhoneNumber(
      this.iti.getNumber()
    );

    return {
      international: phoneNumber.formatInternational(),
      e164: phoneNumber.number,
      country: phoneNumber.country,
    };
  }



  userForm!: FormGroup;

  roomType = '';

  filteredOptions!: Observable<any[]>;

  gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  userContacts: any;

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router,
    public sharedFiltering: SharedFiltering,
    private stateService: State,
    private dialog: MatDialog,
    private logger: LoggerService
  ) {
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
          this.userContacts = result;
          this.stateService.emailSet.set(new Set(['madan']))
          this.stateService.phoneSet.set(new Set(['930']));
          console.log(this.userContacts)

          for (let da of this.userContacts) {
            this.stateService.emailSet.update(list => new Set([...list, da?.email]));
            this.stateService.phoneSet.update(list => new Set([...list, da?.phone]));
          }
        }
      });
  }
  getDBUSers() {
    this.stateService.emailSet.set(new Set(['madan']))
    this.stateService.phoneSet.set(new Set(['930']));
    console.log(this.userContacts)

    for (let da of this.userContacts) {
      this.stateService.emailSet.update(list => new Set([...list, da?.email]));
      this.stateService.phoneSet.update(list => new Set([...list, da?.phone]));
    }
  }

  ngOnInit(): void {
    sessionStorage.clear();

    console.log("madan.ghodechor@cotrav")
    const bgbulkRefId = localStorage.getItem('bkgRef');
    if (bgbulkRefId) {
      this.api.getBookingLogById(bgbulkRefId).subscribe((res: any) => {
        if (res.data.length > 0)
          this.openDialog(bgbulkRefId, res)
      })
    }

    this.userForm = this.fb.group({
      roomType: [],

      id: [{ value: this.stateService.generateUUID(), disabled: true }],

      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      organisation: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gst: ['', [Validators.pattern(this.gstPattern)]],
      is_primary_user: [true],
      primary_user_email: this.userForm?.get('email')?.value,
    });



    /* ---------- EMAIL CHECK ---------- */
    this.userForm.get('email')!.valueChanges.subscribe(value => {
      if (!value) return;

      const email = value.toLowerCase().trim();
      const exists = this.stateService.emailSet().has(email);

      if (exists) {
        this.userForm?.get('email')!.setErrors({ duplicate: true });
        this.logger.log("duplicate")
      } else {
        const errors = this.userForm?.get('email')!.errors;
        if (errors?.['duplicate']) {
          delete errors['duplicate'];
          this.userForm?.get('email')!.setErrors(
            Object.keys(errors).length ? errors : null
          );
        }
      }
    });

    /* ---------- PHONE CHECK ---------- */
    this.userForm?.get('phone')!.valueChanges.subscribe(value => {

      if (!value) return;

      const country = this.iti.getSelectedCountryData();
      const phonepayload = {
        dialCode: '+' + country.dialCode,
        countryIso: country.iso2,
        fullNumber: '+' + country.dialCode + this.phoneInput.nativeElement.value,
        nationalNumber: this.phoneInput.nativeElement.value
      };


      const exists = this.stateService.phoneSet().has(phonepayload.fullNumber);

      if (exists) {
        this.logger.log("duplicate")
        this.userForm?.get('phone')!.setErrors({ duplicate: true });
      } else {
        const errors = this.userForm?.get('phone')!.errors;
        if (errors?.['duplicate']) {
          delete errors['duplicate'];
          this.userForm?.get('phone')!.setErrors(
            Object.keys(errors).length ? errors : null
          );
        }
      }
    });

    this.api.getCompanies().pipe(map((res: any) => {
      return res.data.map((comp: any) => ({ id: comp._id, name: comp.name, gst: comp.gst }));
    })).subscribe((res: any) => {
      this.sharedFiltering.companies = res;
    });

    this.filteredOptions = this.userForm
      .get('organisation')!
      .valueChanges.pipe(
        startWith(''),
        map(value => this.sharedFiltering.filterCompanies(value))
      );

  }

  openDialog(bgbulkRefId: any, res: any): void {

    const dialogRef = this.dialog.open(pendingDetailsComponent, {
      width: '500px',
      data: {
        res
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result === 'startNew') {
        // wipe data, reset forms, clear storage etc
        this.logger.log('User wants fresh booking');
      }

      if (result === 'continue') {
        this.api.getBookingLogById(bgbulkRefId).subscribe((res: any) => {

          const da = res.data[0];

          sessionStorage.setItem('primaryUser', JSON.stringify(da?.primaryUser));

          if (da.stage == 1) {

            const selectedCompany = this.sharedFiltering.companies.find(
              c => c.name === da?.primaryUser?.organisation
            ) || { id: null, name: da?.primaryUser?.organisation };

            this.userForm.patchValue({
              roomType: da?.primaryUser?.roomType,

              id: da?.primaryUser?.id,

              firstName: da?.primaryUser?.firstName,
              lastName: da?.primaryUser?.lastName,
              organisation: selectedCompany,
              email: da?.primaryUser?.email,
              // phone: da?.primaryUser?.phone,
              gst: da?.primaryUser?.gst,
              is_primary_user: true,
              primary_user_email: da?.primaryUser?.primary_user_email,
            })
          }
          if (da.stage == 2) {
            this.router.navigate(['/members-selection'])
          }
          if (da.stage == 3 || da.stage == 4) {
            this.stateService.singleCount.set(da?.singleroom);
            this.stateService.doubleCount.set(da?.doubleroom);
            this.stateService.tripleCount.set(da?.tripleroom);

            sessionStorage.setItem('rooms', JSON.stringify(da?.payload))
            setTimeout(() => {
              this.router.navigate(['/register'])
            }, 10);

          }
        });
      }
    });
  }


  displayCompany(company: Company): string {
    return company ? company.name : '';
  }

  syncPhoneToForm(): void {
    if (!this.iti) return;

    if (this.iti.isValidNumber()) {
      this.userForm.patchValue({
        phone: this.iti.getNumber()
      });
    } else {
      this.userForm.patchValue({
        phone: ''
      });
    }
  }


  setGst(event: any) {
    const company = event.option.value;
    this.logger.log(company)
    this.userForm.patchValue({
      gst: company.gst,
    });
  }

  save(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }


    const country = this.iti.getSelectedCountryData();
    const phonepayload = {
      dialCode: '+' + country.dialCode,
      countryIso: country.iso2,
      fullNumber: '+' + country.dialCode + this.phoneInput.nativeElement.value,
      nationalNumber: this.phoneInput.nativeElement.value
    };

    const organisation = this.userForm.getRawValue().organisation.name ? this.userForm.getRawValue().organisation.name : this.userForm.getRawValue().organisation
    const payload = {
      ...this.userForm.getRawValue(),
      organisation: organisation,
      phone: phonepayload.fullNumber,
      primary_user_email: this.userForm.get('email')!.value
    };

    sessionStorage.setItem('primaryUser', JSON.stringify(payload));
    this.logger.log(payload);
    const bkgRefInLocal = localStorage.getItem('bkgRef');

    let logPayload;

    if (!bkgRefInLocal) {
      logPayload = {
        "stage": 1,
        "primary_user": {
          ...payload
        },
        "userdata": [
        ]
      }
    } else {
      logPayload = {
        "bulkRefId": bkgRefInLocal,
        "stage": 1,
        "primary_user": {
          ...payload
        },
        "userdata": [
        ]
      }
    }

    this.api.createBookingLog(logPayload).subscribe((res: any) => {
      localStorage.setItem('bkgRef', res.data.bulkRefId)
    });


    this.router.navigate(['/members-selection']);
  }

  unlock(e: any) {
    e.target.removeAttribute('readonly');
  }

}
