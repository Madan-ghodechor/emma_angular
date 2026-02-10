import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../service/api';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';

interface RetryToken {
  order: any;
  userData: any;
  bulkRefId: any;
  ref: string;
  logId: string;
  errorCode?: string;
  errorMessage?: string;
  exp: number;
}

@Component({
  selector: 'app-retry-payment',
  imports: [
    TitleCasePipe,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './retry-payment.html',
  styleUrl: './retry-payment.scss',
})
export class RetryPayment implements OnInit {

  token!: string;
  data!: any;

  checkCard = signal(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');

      if (!token) {
        this.router.navigate(['/']);
        return;
      }

      this.token = token;
      this.data = jwtDecode<RetryToken>(this.token);

      console.log(this.data)


      this.api.getBookingLogById(this.data.bulkRefId).subscribe({
        next: (res: any) => {
          console.log(res)
          if (res.data[0].payment == 2)
            this.checkCard.set(2)
          if (res.data[0].payment == 1)
            this.checkCard.set(1)

        }
      })

    });
  }

  retryPayment(booking: any) {

    const payload = {
      userData: this.data.userData,
      bulkRefId: this.data.bulkRefId,
      logId: this.data.logId,
      amount: this.data.order.amount / 100
    }
    this.pay(payload.amount, payload, this.data.order);


  }




  pay(amount: number, payload: any, order: any) {

    if (!order?.id) {
      console.error('Invalid order object', order);
      return;
    }
    this.openRazorpay(order, payload);
  }

  openRazorpay(order: any, payload: any) {

    console.log(order.amount / 100);
    console.log(order.amount);

    const options = {
      key: environment.razorpayKey,
      amount: order.amount / 100,
      currency: 'INR',
      name: 'COTRAV',
      description: 'Payment',
      order_id: order.id,

      image: "https://play-lh.googleusercontent.com/-Gg0VKCGTW25SSQaFSh8ih6iKCbQs2myvuJCUzO1Rpd1lzeRpDmCFNpSzmddQ_QYgIo=w600-h300-pc0xffffff-pd",

      handler: (response: any) => {
        this.api.verifyPayment(response).subscribe({
          next: () => {
            console.log(response)
            this.afterPaymentSuccess(response, payload)
          },
          error: () => {
            console.log(response)
          }
        });
      },

      modal: {
        ondismiss: () => console.log('Payment popup closed')
      },

      theme: {
        color: '#1976d2'
      }
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      console.error('Payment failed', response.error);
      this.afterPaymentFailed(response.error, payload, order)
    });

    rzp.open();
  }

  afterPaymentSuccess(razorpayRes: any, prevData: any) {

    console.log(razorpayRes)

    console.log("after Payment success called")
    const payload = {
      ...razorpayRes,
      ...prevData
    }
    this.api.recordPaymentSuccess(payload).subscribe({
      next: (res) => {
        console.log(res);
        this.router.navigate(['/payment-success'], {
          state: { paymentResponse: res }
        });
      },
      error: () => {

      }
    })
  }
  private paymentFailTimer: any;

  afterPaymentFailed(error: any, payload: any, order: any) {
    clearTimeout(this.paymentFailTimer);

    this.paymentFailTimer = setTimeout(() => {
      this.api.recordFailedPayment({ error, ...payload, order }).subscribe({
        next: (res: any) => console.log(res)
      });
    }, 1000);
  }
}