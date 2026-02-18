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
import { map } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import * as XLSX from 'xlsx';

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
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private api = inject(Api);

  displayedColumns: string[] = ['roomNo', 'type', 'primary_guest', 'checks', 'payment', 'createdAt'];

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

    this.api.getPaymentById(room?.paymentId).pipe(
      map((res: any) => {
        return {
          amount: res?.data?.paymentAmount,
          payment_id: res?.data?.razorpay_payment_id
        }
      })
    ).subscribe({
      next: (res: any) => {
        this.selectedRoom.update((room: any) => ({
          ...room,
          payment: res
        }));

      }
    })
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  exportToExcel(): void {
    const data: any = [];

    this.rooms.forEach((room: any) => {
      room.attendees.forEach((attendee: any) => {
        data.push({
          RoomNumber: room.roomNumber,
          CheckIn: room.checkIn,
          CheckOut: room.checkOut,
          Name: attendee.firstName + ' ' + attendee.lastName,
          Email: attendee.email,
          Company: attendee.company?.name
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');

    XLSX.writeFile(wb, 'Dashboard.xlsx');
  }



}
