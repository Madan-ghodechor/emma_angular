import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

  paymentInProgress = true;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: BeforeUnloadEvent) {
    if (this.paymentInProgress) {
      event.preventDefault();
      event.returnValue = 'Payment is in progress. Do not refresh.';
    }
  }
  home: string | undefined;
  headerImg: any = "images/header.png"

  constructor(private location: Location, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.home = this.router.url
      });

    this.headerImg = localStorage.getItem('header');
  }
  goBack(): void {
    if (this.paymentInProgress) {
      const confirmLeave = confirm('If you go back, payment process will be lost. Continue?');

      if (!confirmLeave) return;
    }

    this.location.back();
  }

}
