import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Api } from '../../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-dynamics',
  imports: [
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './add-dynamics.html',
  styleUrl: './add-dynamics.scss',
})
export class AddDynamics implements OnInit {
  form!: FormGroup;
  isLoading  = false;
  isEditMode = false;
  editEventId: number | null = null;

  headerBannerFile: File | null = null;
  voucherHeaderImageFile: File | null = null;

  private fb       = inject(FormBuilder);
  private api      = inject(Api);
  private snackBar = inject(MatSnackBar);
  private router   = inject(Router);

  ngOnInit(): void {
    this.form = this.fb.group({
      guestsRegistrationEnabled: [false],
      memberPrice:               [null],
      nonMemberPrice:            [null],
      roomPricingExcludingGst:   [false],
      gstPercentage:             [null],
      singleSharingRoomEnabled:  [false],
      singleSharingPrice:        [null],
      doubleSharingRoomEnabled:  [false],
      doubleSharingPrice:        [null],
      tripleSharingRoomEnabled:  [false],
      tripleSharingPrice:        [null],
      resortName:                [''],
      resortAddress:             [''],
      hotelSupportContact:       [''],
      hotelSupportEmail:         [''],
      googleLocation:            [''],
      standardCheckIn:           [''],
      standardCheckOut:          [''],
      termsEventName:            [''],
      cotravSupportContact:      [''],
      cotravSupportEmail:        [''],
    });

    // Auto-fill from events-list Edit navigation
    const e = history.state?.event;
    if (e) {
      this.isEditMode  = true;
      this.editEventId = e.id;
      this.form.patchValue({
        termsEventName:            e.name,
        resortName:                e.resortName,
        resortAddress:             e.resortAddress,
        standardCheckIn:           e.checkIn,
        standardCheckOut:          e.checkOut,
        guestsRegistrationEnabled: e.registrationEnabled,
        memberPrice:               e.memberPrice,
        nonMemberPrice:            e.nonMemberPrice,
        roomPricingExcludingGst:   e.gstExcluded,
        gstPercentage:             e.gstRate,
        singleSharingRoomEnabled:  e.singleSharing,
        singleSharingPrice:        e.singlePrice,
        doubleSharingRoomEnabled:  e.doubleSharing,
        doubleSharingPrice:        e.doublePrice,
        tripleSharingRoomEnabled:  e.tripleSharing,
        tripleSharingPrice:        e.triplePrice,
        hotelSupportContact:       e.hotelSupportContact,
        hotelSupportEmail:         e.hotelSupportEmail,
        googleLocation:            e.googleLocation,
        cotravSupportContact:      e.cotravSupportContact,
        cotravSupportEmail:        e.cotravSupportEmail,
      });
    }
  }

  get guestsRegistrationEnabled(): boolean {
    return this.form.get('guestsRegistrationEnabled')!.value;
  }

  get roomPricingExcludingGst(): boolean {
    return this.form.get('roomPricingExcludingGst')!.value;
  }

  get singleSharingRoomEnabled(): boolean {
    return this.form.get('singleSharingRoomEnabled')!.value;
  }

  get doubleSharingRoomEnabled(): boolean {
    return this.form.get('doubleSharingRoomEnabled')!.value;
  }

  get tripleSharingRoomEnabled(): boolean {
    return this.form.get('tripleSharingRoomEnabled')!.value;
  }

  onHeaderBannerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.headerBannerFile = input.files?.[0] ?? null;
  }

  onVoucherHeaderImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.voucherHeaderImageFile = input.files?.[0] ?? null;
  }

  saveConfiguration(): void {
    this.isLoading = true;
    const payload  = this.buildPayload();

    const request$ = this.isEditMode && this.editEventId != null
      ? this.api.updateDynamics(this.editEventId, payload)
      : this.api.saveDynamics(payload);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(
          this.isEditMode ? 'Configuration updated successfully!' : 'Configuration saved successfully!',
          'Close',
          { horizontalPosition: 'center', verticalPosition: 'top', duration: 3000, panelClass: ['snack-success'] }
        );
        this.router.navigate(['/new/admin/event-list']);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to save. Please try again.', 'Close', {
          horizontalPosition: 'center', verticalPosition: 'top', duration: 4000, panelClass: ['snack-error'],
        });
      },
    });
  }

  private buildPayload(): FormData {
    const v  = this.form.value;
    const fd = new FormData();

    fd.append('guestsRegistrationEnabled', String(v.guestsRegistrationEnabled));
    if (v.guestsRegistrationEnabled) {
      if (v.memberPrice    != null) fd.append('memberPrice',    String(v.memberPrice));
      if (v.nonMemberPrice != null) fd.append('nonMemberPrice', String(v.nonMemberPrice));
    }

    fd.append('roomPricingExcludingGst', String(v.roomPricingExcludingGst));
    if (v.roomPricingExcludingGst && v.gstPercentage != null) {
      fd.append('gstPercentage', String(v.gstPercentage));
    }

    fd.append('singleSharingRoomEnabled', String(v.singleSharingRoomEnabled));
    if (v.singleSharingRoomEnabled && v.singleSharingPrice != null) {
      fd.append('singleSharingPrice', String(v.singleSharingPrice));
    }

    fd.append('doubleSharingRoomEnabled', String(v.doubleSharingRoomEnabled));
    if (v.doubleSharingRoomEnabled && v.doubleSharingPrice != null) {
      fd.append('doubleSharingPrice', String(v.doubleSharingPrice));
    }

    fd.append('tripleSharingRoomEnabled', String(v.tripleSharingRoomEnabled));
    if (v.tripleSharingRoomEnabled && v.tripleSharingPrice != null) {
      fd.append('tripleSharingPrice', String(v.tripleSharingPrice));
    }

    fd.append('resortName',           v.resortName           ?? '');
    fd.append('resortAddress',        v.resortAddress        ?? '');
    fd.append('hotelSupportContact',  v.hotelSupportContact  ?? '');
    fd.append('hotelSupportEmail',    v.hotelSupportEmail    ?? '');
    fd.append('googleLocation',       v.googleLocation       ?? '');
    fd.append('standardCheckIn',      v.standardCheckIn      ?? '');
    fd.append('standardCheckOut',     v.standardCheckOut     ?? '');
    fd.append('termsEventName',       v.termsEventName       ?? '');
    fd.append('cotravSupportContact', v.cotravSupportContact ?? '');
    fd.append('cotravSupportEmail',   v.cotravSupportEmail   ?? '');

    if (this.headerBannerFile)       fd.append('headerBanner',       this.headerBannerFile);
    if (this.voucherHeaderImageFile) fd.append('voucherHeaderImage', this.voucherHeaderImageFile);

    return fd;
  }
}
