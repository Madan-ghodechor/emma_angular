import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface DynamicEventConfig {
  guestsRegistrationEnabled: boolean;
  memberPrice: number | null;
  nonMemberPrice: number | null;
  roomPricingExcludingGst: boolean;
  gstPercentage: number | null;
  singleSharingRoomEnabled: boolean;
  singleSharingPrice: number | null;
  doubleSharingRoomEnabled: boolean;
  doubleSharingPrice: number | null;
  tripleSharingRoomEnabled: boolean;
  tripleSharingPrice: number | null;
  headerBanner: File | null;
  voucherHeaderImage: File | null;
  resortName: string;
  resortAddress: string;
  hotelSupportContact: string;
  hotelSupportEmail: string;
  googleLocation: string;
  standardCheckIn: string;
  standardCheckOut: string;
  termsEventName: string;
  cotravSupportContact: string;
  cotravSupportEmail: string;
}

@Component({
  selector: 'app-add-dynamics',
  imports: [MatSlideToggleModule, ReactiveFormsModule],
  templateUrl: './add-dynamics.html',
  styleUrl: './add-dynamics.scss',
})
export class AddDynamics implements OnInit {
  form!: FormGroup;

  headerBannerFile: File | null = null;
  voucherHeaderImageFile: File | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      guestsRegistrationEnabled: [false],
      memberPrice: [null],
      nonMemberPrice: [null],
      roomPricingExcludingGst: [false],
      gstPercentage: [null],
      singleSharingRoomEnabled: [false],
      singleSharingPrice: [null],
      doubleSharingRoomEnabled: [false],
      doubleSharingPrice: [null],
      tripleSharingRoomEnabled: [false],
      tripleSharingPrice: [null],
      resortName: ['Pragati Resort'],
      resortAddress: ['Shankarpally Mandal, Ranga Reddy District, Hyderabad, Telangana 501203'],
      hotelSupportContact: ['+919309804105'],
      hotelSupportEmail: ['pragati@hotel.com'],
      googleLocation: ['https://share.google/jEQ8GtZ70fUGSq3K3'],
      standardCheckIn: ['13:00'],
      standardCheckOut: ['10:00'],
      termsEventName: ['South Factor'],
      cotravSupportContact: ['+919309804106'],
      cotravSupportEmail: ['madan@cotrav.co'],
    });
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
    const v = this.form.value;

    const config: DynamicEventConfig = {
      guestsRegistrationEnabled: v.guestsRegistrationEnabled,
      memberPrice: v.guestsRegistrationEnabled ? v.memberPrice : null,
      nonMemberPrice: v.guestsRegistrationEnabled ? v.nonMemberPrice : null,
      roomPricingExcludingGst: v.roomPricingExcludingGst,
      gstPercentage: v.roomPricingExcludingGst ? v.gstPercentage : null,
      singleSharingRoomEnabled: v.singleSharingRoomEnabled,
      singleSharingPrice: v.singleSharingRoomEnabled ? v.singleSharingPrice : null,
      doubleSharingRoomEnabled: v.doubleSharingRoomEnabled,
      doubleSharingPrice: v.doubleSharingRoomEnabled ? v.doubleSharingPrice : null,
      tripleSharingRoomEnabled: v.tripleSharingRoomEnabled,
      tripleSharingPrice: v.tripleSharingRoomEnabled ? v.tripleSharingPrice : null,
      headerBanner: this.headerBannerFile,
      voucherHeaderImage: this.voucherHeaderImageFile,
      resortName: v.resortName,
      resortAddress: v.resortAddress,
      hotelSupportContact: v.hotelSupportContact,
      hotelSupportEmail: v.hotelSupportEmail,
      googleLocation: v.googleLocation,
      standardCheckIn: v.standardCheckIn,
      standardCheckOut: v.standardCheckOut,
      termsEventName: v.termsEventName,
      cotravSupportContact: v.cotravSupportContact,
      cotravSupportEmail: v.cotravSupportEmail,
    };

    console.log('Dynamic Event Config:', config);
    // TODO: call API service to save config
  }
}
