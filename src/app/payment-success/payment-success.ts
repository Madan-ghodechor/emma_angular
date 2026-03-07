import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Api } from '../service/api';
import { LoggerService } from '../service/logger.service';

@Component({
  selector: 'app-payment-success',
  imports: [
    CommonModule,
    TitleCasePipe,
    MatCardModule,
    MatIcon,
    MatButtonModule,
  ],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss',

})
export class PaymentSuccess {

  constructor(private api: Api, private logger: LoggerService, private route: ActivatedRoute) { }

  data: any = signal([]);
  id: string | undefined;
  colors: any;

  ngOnInit() {
    sessionStorage.clear();
    localStorage.removeItem('bkgRef');

    this.id = this.route.snapshot.paramMap.get('id') || "";


    this.api.getBookingRecord(this.id).subscribe({
      next: (res: any) => {
        this.data.set(res.data)

        this.api.getWhiteLabel(res.data?.userData[0]?.payment?.assetId).subscribe({
          next: (res: any) => {
            this.colors = res.data;
          }
        })
      }
    })

  }



  generateVC() {
    const payloda = this.payload(this.id, this.data().userData)
    this.api.generateVoucher(payloda).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.id}.pdf`;
      a.click();
    });


  }

  payload(bulkRefId: any, userData: any) {

    let primaryAttendeeName;
    let primaryAttendeeEmail;

    const attendees = userData[0].attendees.map((guest: any) => {
      if (guest.is_primary_user) {
        primaryAttendeeEmail = guest.email
        primaryAttendeeName = guest.firstName + ' ' + guest.lastName
      }
      return {
        "name": guest?.firstName + ' ' + guest.lastName,
        "email": guest?.email,
        "phone": guest?.phone,
      }
    })

    const formatToDDMMYY = (dateString: any) => {
      const d = new Date(dateString);

      const day = String(d.getDate()).padStart(2, '0');

      const month = d.toLocaleString('en-IN', { month: 'short' });

      const year = d.getFullYear();

      return `${day} ${month} ${year}`;
    }
    const getTodayDDMonYYYY = () => {
      const d = new Date();

      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-IN', { month: 'short' });
      const year = d.getFullYear();

      return `${day} ${month} ${year}`;
    }



    let roomtype = userData[0]?.roomtype;
    let checkIn = formatToDDMMYY(userData[0]?.checkIn);
    let checkOut = formatToDDMMYY(userData[0]?.checkOut);

    let payload = {
      "bookingId": bulkRefId,
      "createdAt": getTodayDDMonYYYY(),
      "primaryAttendeeName": primaryAttendeeName,
      "primaryAttendeeEmail": primaryAttendeeEmail,
      "rooms": [
        {
          "type": roomtype,   // Triple, Double, Single
          "checkIn": checkIn,
          "checkOut": checkOut,
          "guests": attendees
        }
      ],
      "whiteLabel": this.colors
    }
    return payload;

  }



  formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

