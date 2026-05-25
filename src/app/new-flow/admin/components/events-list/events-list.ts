import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

export interface EventRow {
  id: number;
  name: string;
  resortName: string;
  resortAddress: string;
  checkIn: string;
  checkOut: string;
  registrationEnabled: boolean;
  memberPrice: number | null;
  nonMemberPrice: number | null;
  singleSharing: boolean;
  singlePrice: number | null;
  doubleSharing: boolean;
  doublePrice: number | null;
  tripleSharing: boolean;
  triplePrice: number | null;
  gstExcluded: boolean;
  gstRate: number | null;
  hotelSupportContact: string;
  hotelSupportEmail: string;
  googleLocation: string;
  cotravSupportContact: string;
  cotravSupportEmail: string;
  createdAt: string;
}

@Component({
  selector: 'app-events-list',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './events-list.html',
  styleUrl: './events-list.scss',
})
export class EventsList {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  searchQuery = '';

  events: EventRow[] = [
    {
      id: 1,
      name: 'South Factor',
      resortName: 'Pragati Resort',
      resortAddress: 'Shankarpally Mandal, Ranga Reddy District, Hyderabad, Telangana 501203',
      checkIn: '13:00',
      checkOut: '10:00',
      registrationEnabled: true,
      memberPrice: 15000,
      nonMemberPrice: 18000,
      singleSharing: true,
      singlePrice: 9500,
      doubleSharing: false,
      doublePrice: null,
      tripleSharing: false,
      triplePrice: null,
      gstExcluded: false,
      gstRate: null,
      hotelSupportContact: '+919309804105',
      hotelSupportEmail: 'pragati@hotel.com',
      googleLocation: 'https://share.google/jEQ8GtZ70fUGSq3K3',
      cotravSupportContact: '+919309804106',
      cotravSupportEmail: 'madan@cotrav.co',
      createdAt: '2026-05-10',
    },
    {
      id: 2,
      name: 'Basant Conclave',
      resortName: 'The Lalit Golf & Spa',
      resortAddress: 'Khopoli, Raigad District, Maharashtra 410203',
      checkIn: '14:00',
      checkOut: '11:00',
      registrationEnabled: true,
      memberPrice: 22000,
      nonMemberPrice: 26000,
      singleSharing: true,
      singlePrice: 12000,
      doubleSharing: true,
      doublePrice: 8500,
      tripleSharing: false,
      triplePrice: null,
      gstExcluded: true,
      gstRate: 18,
      hotelSupportContact: '+912224567890',
      hotelSupportEmail: 'lalit.khopoli@thelalit.com',
      googleLocation: 'https://maps.google.com/?q=The+Lalit+Golf+Spa+Khopoli',
      cotravSupportContact: '+919309804106',
      cotravSupportEmail: 'madan@cotrav.co',
      createdAt: '2026-04-22',
    },
    {
      id: 3,
      name: 'Winter Summit',
      resortName: 'Taj Theog Resort',
      resortAddress: 'Theog, Shimla District, Himachal Pradesh 171201',
      checkIn: '15:00',
      checkOut: '12:00',
      registrationEnabled: false,
      memberPrice: null,
      nonMemberPrice: null,
      singleSharing: true,
      singlePrice: 14000,
      doubleSharing: true,
      doublePrice: 10000,
      tripleSharing: true,
      triplePrice: 7500,
      gstExcluded: true,
      gstRate: 18,
      hotelSupportContact: '+911772456789',
      hotelSupportEmail: 'theog@tajhotels.com',
      googleLocation: 'https://maps.google.com/?q=Taj+Theog+Resort+Shimla',
      cotravSupportContact: '+919309804106',
      cotravSupportEmail: 'madan@cotrav.co',
      createdAt: '2026-03-15',
    },
  ];

  get filtered(): EventRow[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.events;
    return this.events.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.resortName.toLowerCase().includes(q) ||
      e.resortAddress.toLowerCase().includes(q)
    );
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  editEvent(event: EventRow): void {
    this.router.navigate(['../add-event'], {
      relativeTo: this.route,
      state: { event },
    });
  }
}
