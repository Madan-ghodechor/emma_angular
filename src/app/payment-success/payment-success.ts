import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  // res: any = {
  //   "success": true,
  //   "message": "Data stored successfully",
  //   "data": {
  //     "razorpay_order_id": "order_SCNb7WVpMKuMYX",
  //     "razorpay_payment_id": "pay_SCNbQcsY2ZtMT5",
  //     "razorpay_signature": "4d23c58135da8ba2fbad995dc4feec6dddef4b0fea8010ea9fcc19563949c9a6",
  //     "paymentAmount": 19400,
  //     "_id": "698444dcbe92611e933c31cb",
  //     "createdAt": "2026-02-05T07:21:00.383Z",
  //     "updatedAt": "2026-02-05T07:21:00.383Z",
  //     "__v": 0,
  //     "bulkRefId": "BULK_1770276060402_708d53",
  //     "bookings": [
  //       {
  //         "roomId": "single-1",
  //         "roomType": "single",
  //         "checkIn": "2026-03-24T00:00:00.000Z",
  //         "checkOut": "2026-03-26T00:00:00.000Z",
  //         "attendees": [
  //           "698444dcbe92611e933c31d1"
  //         ],
  //         "bulkRefId": "BULK_1770276060402_708d53",
  //         "payment": 1,
  //         "paymentId": "698444dcbe92611e933c31cb",
  //         "_id": "698444dcbe92611e933c31d3",
  //         "createdAt": "2026-02-05T07:21:00.431Z",
  //         "updatedAt": "2026-02-05T07:21:00.431Z",
  //         "__v": 0
  //       },
  //       {
  //         "roomId": "single-2",
  //         "roomType": "single",
  //         "checkIn": "2026-03-24T00:00:00.000Z",
  //         "checkOut": "2026-03-26T00:00:00.000Z",
  //         "attendees": [
  //           "698444dcbe92611e933c31d1"
  //         ],
  //         "bulkRefId": "BULK_1770276060402_708d53",
  //         "payment": 1,
  //         "paymentId": "698444dcbe92611e933c31cb",
  //         "_id": "698444dcbe92611e933c31d3",
  //         "createdAt": "2026-02-05T07:21:00.431Z",
  //         "updatedAt": "2026-02-05T07:21:00.431Z",
  //         "__v": 0
  //       }
  //     ]
  //   }
  // };

  res: any;
  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.res = navigation?.extras.state?.['paymentResponse'];
  }

  data:any;
  ngOnInit() {
    sessionStorage.clear();
    this.data = this.res.data;
    console.log(this.data)
  }

  @ViewChild('receipt') receipt!: ElementRef;


  downloadReceipt() {
    const el = this.receipt.nativeElement;

    html2canvas(el, { scale: 2 }).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(img, 'PNG', 0, 0, width, height);
      pdf.save(`receipt-${this.data .razorpay_payment_id}.pdf`);
    });
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

