import { Component, OnInit } from '@angular/core';
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

  userForm!: FormGroup;

  roomType = '';

  filteredOptions!: Observable<any[]>;

  gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router,
    public sharedFiltering: SharedFiltering
  ) {
    localStorage.clear();
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
    const payload = {
      ...this.userForm.getRawValue(),
      primary_user_email: this.userForm.get('email')!.value
    };

    localStorage.setItem('primaryUser', JSON.stringify(payload));
    console.log(payload);
    this.router.navigate(['/members-selection']);
  }
}
