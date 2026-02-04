import { Component, Inject } from '@angular/core';
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

  constructor(private dialogRef: MatDialogRef<FormDialogComponent>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, public sharedFiltering: SharedFiltering, private api: Api, private stateService: State) { }

  roomType: string = '';
  userForm!: FormGroup;
  filteredOptions!: Observable<any[]>;

  gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

  ngOnInit() {

    this.userForm = this.fb.group({
      roomType: [this.data.roomType],
      id: crypto.randomUUID(),

      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      organisation: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gst: ['', [Validators.required, Validators.pattern(this.gstPattern)]],
    });

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
      const exists = this.stateService.phoneSet().has(phone);

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

  save() {
    const email = this.userForm?.value.email;
    const phone = this.userForm?.value.phone;

    this.stateService.emailSet.update(list => new Set([...list, email]));
    this.stateService.phoneSet.update(list => new Set([...list, phone]));

    this.dialogRef.close(this.userForm?.value);
  }
}
