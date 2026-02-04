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

import intlTelInput from 'intl-tel-input';
import { parsePhoneNumber } from 'libphonenumber-js';
import { State } from '../service/state';

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
  ],
  templateUrl: './primary-user.html',
  styleUrl: './primary-user.scss',
})

export class PrimaryUser implements OnInit {

  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;

  iti: any;
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

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router,
    public sharedFiltering: SharedFiltering,
    private stateService: State
  ) {
    localStorage.clear();
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
          for(let da of result){ 
            this.stateService.emailSet.update(list => new Set([...list, da?.email]));
            this.stateService.phoneSet.update(list => new Set([...list, da?.phone]));
          }
        }
      });

  }

  ngOnInit(): void {

    this.userForm = this.fb.group({
      roomType: [],

      id: [{ value: crypto.randomUUID(), disabled: true }],

      firstName: ['Madan', [Validators.required, Validators.minLength(2)]],
      lastName: ['Ghodechor', [Validators.required, Validators.minLength(2)]],
      organisation: ['Emma Pvt Ltd', [Validators.required, Validators.minLength(2)]],
      email: ['madan.ghodechor@cotrav.co', [Validators.required, Validators.email]],
      phone: ['9309804106', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gst: ['', [Validators.required, Validators.pattern(this.gstPattern)]],
      is_primary_user: [true],
      primary_user_email: this.userForm?.get('email')?.value,
    });


    // this.userForm = this.fb.group({
    //   roomType: [],

    //   id: [{ value: crypto.randomUUID(), disabled: true }],

    //   firstName: ['', [Validators.required, Validators.minLength(2)]],
    //   lastName: ['', [Validators.required, Validators.minLength(2)]],
    //   organisation: ['', [Validators.required, Validators.minLength(2)]],
    //   email: ['', [Validators.required, Validators.email]],
    //   phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    //   gst: ['', [Validators.required, Validators.pattern(this.gstPattern)]],
    // });



    /* ---------- EMAIL CHECK ---------- */
    this.userForm.get('email')!.valueChanges.subscribe(value => {
      if (!value) return;

      const email = value.toLowerCase().trim();
      const exists = this.stateService.emailSet().has(email);

      if (exists) {
        this.userForm?.get('email')!.setErrors({ duplicate: true });
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
        console.log("duplicate")
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


  displayCompany(company: Company): string {
    return company ? company.name : '';
  }

  syncPhoneToForm(): void {
    if (!this.iti) return;

    if (this.iti.isValidNumber()) {
      this.userForm.patchValue({
        phone: this.iti.getNumber() // +919876543210
      });
    } else {
      this.userForm.patchValue({
        phone: ''
      });
    }
  }


  setGst(event: any) {
    const company = event.option.value;
    console.log(company)
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

    const payload = {
      ...this.userForm.getRawValue(),
      phone: phonepayload.fullNumber,
      primary_user_email: this.userForm.get('email')!.value
    };

    localStorage.setItem('primaryUser', JSON.stringify(payload));
    console.log(payload);
    this.router.navigate(['/members-selection']);
  }
}
