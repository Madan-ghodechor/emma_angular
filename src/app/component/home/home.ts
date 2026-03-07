import { Component, inject, OnInit } from '@angular/core';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../../service/api';
import { Router } from '@angular/router';

export interface Company {
  name: string;
  industry: string;
  region: string;
  color: string;
  abbr: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {

  companyControl = new FormControl<string | Company>('');

  companiesFiltered: Company[] = [];
  companies: any;

  selectedCompany: any | null = null;
  isConfirmed = false;

  api = inject(Api);
  router = inject(Router)

  ngOnInit(): void {
    this.companiesFiltered = this.companies;

    this.companyControl.valueChanges.subscribe(value => {

      const query =
        typeof value === 'string'
          ? value
          : value?.name ?? '';

      this.companiesFiltered = this.search(query);

      if (typeof value === 'string') {
        this.selectedCompany = null;
        this.isConfirmed = false;
      }

    });

    this.api.getWhiteLabelCompanies().subscribe({
      next: (res: any) => {
        this.companies = res.data;
        this.companiesFiltered = res.data;
      }
    })

  }

  /** show company name in input */
  displayFn(company: Company | string | null): string {
    if (!company) return '';
    return typeof company === 'string' ? company : company.name;
  }

  /** user selects company */
  selectCompany(company: Company): void {
    this.selectedCompany = company;
    this.isConfirmed = false;
  }

  /** clear input */
  clear(): void {
    this.companyControl.setValue('');
    this.selectedCompany = null;
    this.isConfirmed = false;
    this.companiesFiltered = this.companies;
  }

  cancel(): void {
    this.clear();
  }

  confirm(): void {
    if (this.selectedCompany) {
      this.isConfirmed = true;
      localStorage.setItem('whiteLabel', JSON.stringify(this.selectedCompany));
      localStorage.setItem('header', this.selectedCompany?.assets?.web_header);

      setTimeout(() => {
        this.router.navigate(['/primary-pax'])
      }, 1000);
    }
  }

  private search(query: string): Company[] {
    const q = query.toLowerCase().trim();

    if (!q) return this.companies;

    return this.companies.filter((c: any) =>
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  }

  // private readonly companies: Company[] = [
  //   { name: 'Accenture', industry: 'Consulting', region: 'Global', color: '#A100FF', abbr: 'AC' },
  //   { name: 'Amazon Web Services', industry: 'Cloud', region: 'USA', color: '#FF9900', abbr: 'AW' },
  //   { name: 'Apple Inc.', industry: 'Technology', region: 'USA', color: '#555555', abbr: 'AP' },
  //   { name: 'BlackRock', industry: 'Finance', region: 'USA', color: '#1A1A2E', abbr: 'BR' },
  //   { name: 'Boston Consulting Group', industry: 'Consulting', region: 'Global', color: '#00A859', abbr: 'BC' },
  //   { name: 'Cisco Systems', industry: 'Networking', region: 'USA', color: '#1BA0D7', abbr: 'CS' },
  //   { name: 'Deloitte', industry: 'Professional Services', region: 'Global', color: '#86BC25', abbr: 'DL' },
  //   { name: 'Deutsche Bank', industry: 'Banking', region: 'Germany', color: '#0018A8', abbr: 'DB' },
  //   { name: 'Ernst & Young', industry: 'Professional Services', region: 'Global', color: '#F6A800', abbr: 'EY' },
  //   { name: 'Goldman Sachs', industry: 'Finance', region: 'USA', color: '#6699FF', abbr: 'GS' },
  //   { name: 'Google LLC', industry: 'Technology', region: 'USA', color: '#4285F4', abbr: 'GO' },
  //   { name: 'HSBC Holdings', industry: 'Banking', region: 'UK', color: '#DB0011', abbr: 'HS' },
  //   { name: 'IBM Corporation', industry: 'Technology', region: 'USA', color: '#052FAD', abbr: 'IB' },
  //   { name: 'Infosys', industry: 'IT Services', region: 'India', color: '#007CC3', abbr: 'IF' },
  //   { name: 'JPMorgan Chase', industry: 'Banking', region: 'USA', color: '#003087', abbr: 'JP' },
  //   { name: 'KPMG', industry: 'Professional Services', region: 'Global', color: '#00338D', abbr: 'KP' },
  //   { name: 'McKinsey & Company', industry: 'Consulting', region: 'Global', color: '#1F3059', abbr: 'MC' },
  //   { name: 'Microsoft Corporation', industry: 'Technology', region: 'USA', color: '#00A4EF', abbr: 'MS' },
  //   { name: 'Morgan Stanley', industry: 'Finance', region: 'USA', color: '#003399', abbr: 'MO' },
  //   { name: 'Oracle Corporation', industry: 'Technology', region: 'USA', color: '#F80000', abbr: 'OR' },
  //   { name: 'PricewaterhouseCoopers', industry: 'Professional Services', region: 'Global', color: '#D04A02', abbr: 'PW' },
  //   { name: 'Salesforce', industry: 'SaaS', region: 'USA', color: '#00A1E0', abbr: 'SF' },
  //   { name: 'SAP SE', industry: 'Enterprise Software', region: 'Germany', color: '#008FD3', abbr: 'SA' },
  //   { name: 'Siemens AG', industry: 'Industrial', region: 'Germany', color: '#009999', abbr: 'SI' },
  //   { name: 'Tata Consultancy Services', industry: 'IT Services', region: 'India', color: '#7C4DFF', abbr: 'TC' },
  //   { name: 'Wipro Limited', industry: 'IT Services', region: 'India', color: '#5383EC', abbr: 'WP' },
  // ];
}