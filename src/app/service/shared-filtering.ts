import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

interface Company {
  _id: string;
  name: string;
  gst: string;
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharedFiltering {

  constructor() { }

  companies: any[] = [];

  public filterCompanies(value: string | Company): Company[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value.name.toLowerCase();

    return this.companies.filter(company =>
      company.name.toLowerCase().includes(filterValue)
    );
  }
}
