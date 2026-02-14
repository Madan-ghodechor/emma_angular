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
  ngOnInit() {
    sessionStorage.clear();
    localStorage.clear();

    this.id = this.route.snapshot.paramMap.get('id') || "";


    this.api.getBookingRecord(this.id).subscribe({
      next: (res: any) => {
        this.data.set(res.data)
      }
    })
  }



  generateVC() {
    const payloda = this.payload(this.id, this.data().userData)
    this.api.generateVoucher(payloda).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'voucher.pdf';
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
      ]
    }
    return payload;

  }



















  @ViewChild('receipt') receipt!: ElementRef;
  @ViewChild('pdfHeader') pdfHeader!: ElementRef;

  async downloadReceipt() {
    const element = this.receipt.nativeElement;

    // 🧠 MEMORY CONTROL (VERY IMPORTANT)
    const scale = 1;

    // ==============================
    // BODY CAPTURE
    // ==============================
    const bodyCanvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // use JPEG -> MUCH lighter than PNG
    const bodyImg = bodyCanvas.toDataURL('image/jpeg', 0.85);

    // ==============================
    // HEADER CAPTURE (ONCE)
    // ==============================
    const headerCanvas = await html2canvas(this.pdfHeader.nativeElement, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const headerImg = headerCanvas.toDataURL('image/jpeg', 0.9);

    // ==============================
    // PDF
    // ==============================
    const pdf = new jsPDF('p', 'pt', [595.28, 841.89]);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // keep ratio
    const headerHeight = (headerCanvas.height * pageWidth) / headerCanvas.width;
    const footerHeight = 30;

    const contentHeight = pageHeight - headerHeight - footerHeight;

    const imgWidth = pageWidth;
    const imgHeight = (bodyCanvas.height * imgWidth) / bodyCanvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    let page = 1;

    // ==============================
    // PAGE LOOP
    // ==============================
    while (heightLeft > 0) {
      if (page > 1) pdf.addPage();

      // HEADER
      pdf.addImage(headerImg, 'JPEG', 0, 0, pageWidth, headerHeight);

      // BODY SLICE
      pdf.addImage(
        bodyImg,
        'JPEG',
        0,
        headerHeight - position,
        imgWidth,
        imgHeight
      );

      // FOOTER
      this.drawFooter(pdf, page, pageWidth, pageHeight);

      heightLeft -= contentHeight;
      position += contentHeight;
      page++;
    }

    pdf.save(`voucher-${this.data.razorpay_payment_id}.pdf`);
  }

  drawFooter(pdf: jsPDF, page: number, pageWidth: number, pageHeight: number) {
    pdf.setFontSize(10);
    pdf.text(`Page ${page}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }




  formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

