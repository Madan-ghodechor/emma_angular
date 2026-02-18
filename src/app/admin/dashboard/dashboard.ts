import { Component, ViewChild, AfterViewInit, OnInit, inject, signal } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { Api } from '../services/api';
import { CurrencyPipe, DatePipe, JsonPipe, TitleCasePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

interface Room {
  roomNo: number;
  type: string;
  status: string;
  price: number;
  description: string;
  roomType: string,
  roomId: string,
  bulkRefId: string
  checkIn: string
  checkOut: string
  paymentId: any
}

@Component({
  selector: 'app-dashboard',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatPaginator,
    MatSort,
    MatSelectModule,
    MatDividerModule,
    JsonPipe,
    TitleCasePipe,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private api = inject(Api);

  displayedColumns: string[] = ['roomNo', 'type', 'payment', 'checkIn', 'checkOut', 'createdAt'];

  rooms: Room[] = [];

  dataSource = new MatTableDataSource<Room>([]);

  selectedRoom: any = signal([]);

  loading = false;
  totalRooms = signal(0)
  percentage = signal(0)
  usedRooms = signal(0)
  registeredUserCount = signal(0)
  collectedAmount = signal(0)

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;

    this.api.getDashBord().subscribe({
      next: (res: any) => {
        const rooms = res?.data?.rooms ?? [];
        const user_count = res?.data?.user_count ?? [];
        const collectedAmount = res?.data?.totelAmount ?? [];

        this.rooms = rooms;
        this.dataSource.data = rooms;

        const per = Math.round((rooms.length / environment.total_rooms) * 100)
        this.percentage.set(per);
        this.totalRooms.set(environment.total_rooms);
        this.usedRooms.set(rooms.length)
        this.registeredUserCount.set(user_count)
        this.collectedAmount.set(collectedAmount)
      }
      ,
      error: (err) => {
        console.error('Dashboard load failed', err);
        this.loading = false;
      }
    });
  }

  filterByType(type: string): void {
    if (!type) {
      this.dataSource.data = this.rooms;
      return;
    }

    this.dataSource.data = this.rooms.filter(room => room?.roomType === type);
  }


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  selectRoom(room: Room): void {
    this.selectedRoom.set(room);

    this.api.getPaymentById(room?.paymentId).pipe().subscribe({
      next: (res) => {

        // "_id": "699403578f32c560c96eb31b",
        // "razorpay_order_id": "order_SH6b4Hh7dlOacV",
        // "razorpay_payment_id": "pay_SH6bE2DeQ2oHFR",
        // "razorpay_signature": "8690965daa13c1814f931e8090d4f4152ff3d6c000916ccb11abc8031a443afd",
        // "paymentAmount": 9500,
        // "createdAt": "2026-02-17T05:57:43.603Z",
        // "updatedAt": "2026-02-17T05:57:43.603Z",
        // "__v": 0

        // this.selectedRoom.update((room: any) => ({
        //   ...room,
        //   payment : 
        // }));

      }
    })
  }

}
