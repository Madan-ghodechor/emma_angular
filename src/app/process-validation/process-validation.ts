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
}
