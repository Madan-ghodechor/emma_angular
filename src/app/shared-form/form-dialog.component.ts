import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedFiltering } from '../service/shared-filtering';
import { map, Observable, startWith } from 'rxjs';
import { Api } from '../service/api';
import { State } from '../service/state';

import intlTelInput from 'intl-tel-input';
import { parsePhoneNumber } from 'libphonenumber-js';

interface Company {
  _id: string;
  name: string;
  gst: string;
  address: string;
}


@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss',
  imports: [
    MatDialogActions,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AsyncPipe,
    MatAutocompleteModule
  ]
})
export class FormDialogComponent {


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

  @ViewChild('scrollBox') scrollBox!: ElementRef;

  ngAfterViewChecked() {
    const el = this.scrollBox.nativeElement;
    el.scrollTop = el.scrollHeight;

  }

  constructor(private dialogRef: MatDialogRef<FormDialogComponent>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, public sharedFiltering: SharedFiltering, private api: Api, private stateService: State) { }

  roomType: string = '';
  userForm!: FormGroup;
  filteredOptions!: Observable<any[]>;

  gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  primaryAdded = false;
  formNumber = ''

  ngOnInit() {
    this.primaryAdded = this.data.primaryAdded;

    if (typeof (this.data.roomId) == 'object') {
      this.formNumber = this.data.roomId.attendees.length == 0 ? '1st' : this.data.roomId.attendees.length == 1 ? '2nd' : '3rd';
    } else {
      this.formNumber = 'Edit'
    }


    this.userForm = this.fb.group({
      roomType: [this.data.roomType],
      id: crypto.randomUUID(),
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      organisation: ['', [Validators.required, Validators.minLength(2)]],
      gst: ['', [Validators.pattern(this.gstPattern)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    });

    const attendeeData = this.data.attendee;
    if (attendeeData) {

      this.stateService.emailSet.update(list => {
        const newSet = new Set(list);
        newSet.delete(attendeeData.email);
        return newSet;
      });

      this.stateService.phoneSet.update(list => {
        const newSet = new Set(list);
        newSet.delete(attendeeData.phone);
        return newSet;
      });

      this.userForm.patchValue({
        roomType: attendeeData?.roomType,
        id: attendeeData?.id,
        firstName: attendeeData?.firstName,
        lastName: attendeeData?.lastName,
        organisation: attendeeData?.organisation,
        email: attendeeData?.email,
        phone: attendeeData?.phone,
        gst: attendeeData?.gst,
      })
    }

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

      const phone = value.trim();
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

    if (typeof (this.data.roomId) == 'object')
      if (this.data.roomId.attendees.length > 0) {
        setTimeout(() => {

          const defaultCompany = this.sharedFiltering.companies.find(u => u.name === this.data.roomId.attendees[0].organisation.name);

          this.userForm.get('organisation')?.setValue(defaultCompany || '')
          // this.userForm.get('gst')?.setValue(this.data.roomId.attendees[0].gst)
        }, 100);
      }

  }


  displayCompany(company: Company): string {
    return company ? company.name : '';
  }

  setGst(event: any) {
    const company = event.option.value;
    this.userForm.get('gst')?.setValue(company.gst)
  }
  close() {
    this.dialogRef.close();
  }
  closeWithData(formValue: any) {
    this.dialogRef.close(formValue);
  }
  addPrimaryUser() {
    this.dialogRef.close('triggerButton');
  }

  save() {
    const country = this.iti.getSelectedCountryData();
    const phonepayload = {
      dialCode: '+' + country.dialCode,
      countryIso: country.iso2,
      fullNumber: '+' + country.dialCode + this.phoneInput.nativeElement.value,
      nationalNumber: this.phoneInput.nativeElement.value
    };
    this.userForm.patchValue({
      phone: phonepayload.fullNumber
    })

    const email = this.userForm?.value.email;
    const phone = phonepayload.fullNumber;

    this.stateService.emailSet.update(list => new Set([...list, email]));
    this.stateService.phoneSet.update(list => new Set([...list, phone]));




    this.dialogRef.close(this.userForm?.value);
  }

  ngOnDestroy() {
    console.log("component destroyed")
    const attendeeData = this.data.attendee;
    if (attendeeData) {

      const country = this.iti.getSelectedCountryData();

      const phonepayload = {
        dialCode: '+' + country.dialCode,
        countryIso: country.iso2,
        fullNumber: '+' + country.dialCode + this.phoneInput.nativeElement.value,
        nationalNumber: this.phoneInput.nativeElement.value
      };


      const email = this.userForm?.value.email;
      const phone = phonepayload.fullNumber;

      if (email == attendeeData.email) {
        this.stateService.emailSet.update(list => new Set([...list, email]));
      }
      if (phone == this.userForm?.value.phone) {
        this.stateService.phoneSet.update(list => new Set([...list, phone]));
      }

    }



  }
}
