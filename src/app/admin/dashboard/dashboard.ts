import { Component, ViewChild, OnInit, inject, signal } from '@angular/core';

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
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
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
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    TitleCasePipe,
    DatePipe,
    CurrencyPipe,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private api = inject(Api);

  displayedColumns: string[] = ['roomNo', 'type', 'primary_guest', 'checks', 'payment', 'createdAt', 'resendVoucher'];

  rooms: any = [];

  dataSource = new MatTableDataSource<Room>([]);

  selectedRoom: any = signal([]);

  loading = false;
  totalRooms = signal(0)
  percentage = signal(0)
  usedRooms = signal(0)
  registeredUserCount = signal(0)
  collectedAmount = signal(0)

  idFilter = '';
  nameFilter = '';

  ngOnInit(): void {
    this.loadDashboard();

    this.dataSource.filterPredicate = (data: any, _) => {

      const idSearch = this.idFilter.trim().toLowerCase();
      const nameSearch = this.nameFilter.trim().toLowerCase();

      // ✅ ID match logic
      const idMatch = !idSearch ||
        (data?.bulkRefId || '').toLowerCase().includes(idSearch) ||
        (data?.roomId || '').toLowerCase().includes(idSearch) ||
        (data?.paymentId || '').toString().toLowerCase().includes(idSearch);

      // ✅ Guest name match logic
      const nameMatch = !nameSearch ||
        data?.attendees?.some((att: any) => {
          const first = att?.firstName?.toLowerCase() || '';
          const last = att?.lastName?.toLowerCase() || '';
          return first.includes(nameSearch) || last.includes(nameSearch);
        });

      return idMatch && nameMatch;
    };
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

    this.dataSource.data = this.rooms.filter((room: any) => room?.roomType === type);
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


  filterById(event: Event) {
    this.idFilter = (event.target as HTMLInputElement).value;
    this.dataSource.filter = Math.random().toString(); // trigger refresh
  }

  filterByGuestName(event: Event) {
    this.nameFilter = (event.target as HTMLInputElement).value;
    this.dataSource.filter = Math.random().toString(); // trigger refresh
  }



  exportToExcel(): void {

    if (!this.rooms?.length) {
      console.warn('No data available for export');
      return;
    }

    const data = this.rooms.flatMap((room: any) =>
      room.attendees.map((attendee: any) => ({
        RoomNumber: room.bulkRefId,
        CheckIn: this.formatDate(room.checkIn),
        CheckOut: this.formatDate(room.checkOut),
        RoomType: `${room.roomType} Occupancy`,
        Name: `${attendee.firstName || ''} ${attendee.lastName || ''} ${attendee?.is_primary_user ? '( Primary Guest )' : ''}`.trim(),
        Email: attendee.email || '',
        Phone: attendee.phone || '',
        Company: attendee.company?.name + (attendee.company?.gst != '' ? ` (${attendee.company?.gst})` : '') || ''
      }))
    );

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // ✅ Auto column width
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...data.map((row: any) => (row[key] ? row[key].toString().length : 0))
      ) + 3
    }));

    ws['!cols'] = colWidths;

    // ✅ Enable AutoFilter
    const range = XLSX.utils.decode_range(ws['!ref'] as string);
    ws['!autofilter'] = {
      ref: ws['!ref'] as string
    };

    // ✅ Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');

    const fileName = `Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }


  private formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB');
  }


  private formatDateInto(date: any): string {
    if (!date) return '';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  sendVouchers(da: any) {

    const primaryAttendee = da?.attendees.filter((attendee: any) => attendee.is_primary_user == true)
    let data = {
      "_id": da?._id,
      "roomId": da?.roomId,
      "roomType": da?.roomType,
      "checkIn": this.formatDateInto(da?.checkIn),
      "checkOut": this.formatDateInto(da?.checkOut),
      "attendees": da?.attendees,
      "bulkRefId": da?.bulkRefId,
      "primaryAttendee":primaryAttendee[0],
      "payment": {
        ...da?.payment
      },
      "paymentId": da?.paymentId,
      "createdAt": this.formatDateInto(da?.createdAt)
    }

    

  }



}
