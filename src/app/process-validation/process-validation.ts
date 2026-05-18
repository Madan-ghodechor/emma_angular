import { Component, signal } from '@angular/core';
import { Api } from '../service/api';
import { map, startWith } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from '../service/logger.service';
import { SharedFiltering } from '../service/shared-filtering';
import { State } from '../service/state';
import { JsonPipe } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-process-validation',
  imports: [],
  templateUrl: './process-validation.html',
  styleUrl: './process-validation.scss',
})
export class ProcessValidation {

  data: any = signal('');

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router,
    public sharedFiltering: SharedFiltering,
    private stateService: State,
    private dialog: MatDialog,
    private logger: LoggerService,
    private route: ActivatedRoute
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
          for (let da of result) {
            this.stateService.emailSet.update(list => new Set([...list, da?.email]));
            this.stateService.phoneSet.update(list => new Set([...list, da?.phone]));
          }
        }
      });

  }

  ngOnInit() {

    // payment-success/CTXEHB_1770793275153_6360e6

    sessionStorage.clear();
    localStorage.clear()

    const bgbulkRefId = this.route.snapshot.paramMap.get('id') || "";

    if (this.isEmmaOrderId(bgbulkRefId)) {
      this.loadEmmaRegistrationBooking(bgbulkRefId);
      return;
    }

    localStorage.setItem('bkgRef', bgbulkRefId)

    this.api.getCompanies().pipe(map((res: any) => {
      return res.data.map((comp: any) => ({ id: comp._id, name: comp.name, gst: comp.gst }));
    })).subscribe((res: any) => {
      this.sharedFiltering.companies = res;
    });


    this.api.getBookingLogById(bgbulkRefId).subscribe((res: any) => {
      const da = res.data[0];
      this.data.set(da)

      sessionStorage.setItem('primaryUser', JSON.stringify(da?.primaryUser));

      if (da.stage == 1) {
        this.router.navigate(['/'])
      }
      if (da.stage == 2) {
        sessionStorage.setItem('rooms', JSON.stringify(da?.payload))
        setTimeout(() => {
          this.router.navigate(['/members-selection'])
        }, 10);
      }

      if (da.stage == 3 || da.stage == 4) {
        this.stateService.singleCount.set(da?.singleroom);
        this.stateService.doubleCount.set(da?.doubleroom);
        // this.stateService.tripleCount.set(da?.tripleroom);

        sessionStorage.setItem('rooms', JSON.stringify(da?.payload))
        setTimeout(() => {
          this.router.navigate(['/register'])
        }, 10);

      }

    });
  }

  private isEmmaOrderId(id: string): boolean {
    return /^EC-?/i.test(id);
  }

  private loadEmmaRegistrationBooking(orderId: string): void {
    localStorage.setItem('bkgRef', orderId);
    localStorage.setItem('emmaOrderId', orderId);

    this.api.getEmmaRegistrationBookingStatus(orderId)
      .subscribe({
        next: (res: any) => {
          const registration = this.getEmmaRegistrationData(res);

          if (!registration) {
            this.logger.error('EMMA registration booking status not found', res);
            this.router.navigate(['/eema-registration']);
            return;
          }

          const payload = this.buildEmmaRegistrationPayload(registration, orderId);

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

          sessionStorage.setItem('sessionfrom', JSON.stringify({
            payload: {
              ...payload,
              fee: 0,
              gstAmount: 0,
              totalAmount: 0,
            },
            fee: 0,
            gstAmount: 0,
            totalAmount: 0,
            isEmma: payload.memberType === 'eema'
          }));

          this.router.navigate(['/members-selection']);
        },
        error: (err) => {
          this.logger.error('EMMA registration booking status failed', err);
          this.router.navigate(['/eema-registration']);
        }
      });
  }

  private getEmmaRegistrationData(res: any): any {
    if (Array.isArray(res?.data)) {
      return res.data[0];
    }

    return res?.data?.registrationData
      || res?.data?.registration
      || res?.data
      || res?.registrationData
      || res?.registration
      || null;
  }

  private buildEmmaRegistrationPayload(registration: any, orderId: string): any {
    const memberType = registration?.memberType
      || (registration?.isEmma || registration?.isEEMAMember === 1 ? 'eema' : 'non');
    const fee = Number(registration?.fee ?? registration?.baseFee ?? (memberType === 'eema' ? 15000 : 18000));
    const gstAmount = Number(registration?.gstAmount ?? Math.round(fee * (environment.gst - 1)));
    const totalAmount = Number(registration?.totalAmount ?? registration?.amount ?? fee + gstAmount);
    const company = registration?.company?.name
      || registration?.company
      || registration?.organisation
      || '';

    return {
      ...registration,
      orderId: registration?.orderId || orderId,
      memberType,
      firstName: registration?.firstName || '',
      lastName: registration?.lastName || '',
      email: registration?.email || '',
      phone: registration?.phone || '',
      company,
      gst: registration?.gst || '',
      fee,
      gstAmount,
      totalAmount,
    };
  }
}
