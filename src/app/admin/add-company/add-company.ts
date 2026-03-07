import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe, NgIf } from '@angular/common';
import { Api } from '../services/api';

@Component({
  selector: 'app-add-company',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, JsonPipe],
  templateUrl: './add-company.html',
  styleUrl: './add-company.scss',
})
export class AddCompany implements OnDestroy {
  private fb = inject(FormBuilder);
  private api = inject(Api);
  submitted = signal(false);
  result = signal<Record<string, unknown> | null>(null);
  apiPayload = signal<FormData | null>(null);
  logoErrors = signal<string[]>(['', '', '', '']);
  logoUrls = signal<(string | null)[]>([null, null, null, null]);
  logoFiles: (File | null)[] = [null, null, null, null];

  industryOptions = ['tech', 'finance', 'healthcare', 'manufacturing', 'education', 'hospitality'];
  regionOptions = ['india', 'usa', 'europe', 'middle-east', 'apac'];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    industry: ['', [Validators.required]],
    region: ['', [Validators.required]],
    companyColor: ['#5e08ff', [Validators.required, Validators.pattern(/^#([0-9a-fA-F]{6})$/)]],
    themeMainColor: ['#0f172a', [Validators.required, Validators.pattern(/^#([0-9a-fA-F]{6})$/)]],
    themeSecondaryColor: ['#14b8a6', [Validators.required, Validators.pattern(/^#([0-9a-fA-F]{6})$/)]],
    abbr: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2,6}$/)]],
  });

  ngOnDestroy(): void {
    for (const url of this.logoUrls()) {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  }

  onLogoSelect(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!this.isValidLogo(file)) {
      this.setLogoError(index, 'Only .svg, .png, .jpg, .jpeg files are allowed.');
      this.logoFiles[index] = null;
      input.value = '';
      return;
    }

    const currentUrls = [...this.logoUrls()];
    if (currentUrls[index]) {
      URL.revokeObjectURL(currentUrls[index] as string);
    }

    this.logoFiles[index] = file;
    currentUrls[index] = URL.createObjectURL(file);
    this.logoUrls.set(currentUrls);
    this.setLogoError(index, '');
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = new FormData();
    payload.append('headerFirstLogo', this.logoFiles[0] as File);
    payload.append('headerSecondLogo', this.logoFiles[1] as File);
    payload.append('headerThirdLogo', this.logoFiles[2] as File);
    payload.append('websiteHeader', this.logoFiles[3] as File);
    payload.append('name', this.form.value.name as string);
    payload.append('industry', this.form.value.industry as string);
    payload.append('region', this.form.value.region as string);
    payload.append('companyColor', this.form.value.companyColor as string);
    payload.append('themeMainColor', this.form.value.themeMainColor as string);
    payload.append('themeSecondaryColor', this.form.value.themeSecondaryColor as string);
    payload.append('abbr', (this.form.value.abbr as string).toUpperCase());

    this.api.saveCompany(payload).subscribe({
      next: (res:any)=>{
        console.log(res);
      }
    });

    this.result.set({
      headerFirstLogo: this.fileMeta(this.logoFiles[0]),
      headerSecondLogo: this.fileMeta(this.logoFiles[1]),
      headerThirdLogo: this.fileMeta(this.logoFiles[2]),
      websiteHeader: this.fileMeta(this.logoFiles[3]),
      name: this.form.value.name,
      industry: this.form.value.industry,
      region: this.form.value.region,
      companyColor: this.form.value.companyColor,
      themeMainColor: this.form.value.themeMainColor,
      themeSecondaryColor: this.form.value.themeSecondaryColor,
      abbr: (this.form.value.abbr || '').toUpperCase(),
    });
  }

  reset(): void {
    this.form.reset({
      name: '',
      industry: '',
      region: '',
      companyColor: '#5e08ff',
      themeMainColor: '#0f172a',
      themeSecondaryColor: '#14b8a6',
      abbr: '',
    });
    this.submitted.set(false);
    this.result.set(null);
    this.apiPayload.set(null);
    this.logoErrors.set(['', '', '', '']);

    for (const url of this.logoUrls()) {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
    this.logoUrls.set([null, null, null, null]);
    this.logoFiles = [null, null, null, null];
  }

  hasFieldError(controlName: 'name' | 'industry' | 'region' | 'companyColor' | 'themeMainColor' | 'themeSecondaryColor' | 'abbr'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  private isValidLogo(file: File): boolean {
    const allowed = ['image/svg+xml', 'image/png', 'image/jpeg'];
    const extValid = /\.(svg|png|jpe?g)$/i.test(file.name);
    return allowed.includes(file.type) || extValid;
  }

  private validateLogos(): boolean {
    let valid = true;
    for (let i = 0; i < this.logoFiles.length; i += 1) {
      if (!this.logoFiles[i]) {
        this.setLogoError(i, 'Please upload this logo.');
        valid = false;
      }
    }
    return valid;
  }

  private setLogoError(index: number, message: string): void {
    const next = [...this.logoErrors()];
    next[index] = message;
    this.logoErrors.set(next);
  }

  private fileMeta(file: File | null): Record<string, unknown> | null {
    if (!file) {
      return null;
    }

    return {
      name: file.name,
      type: file.type,
      size: file.size,
    };
  }

  getPayload(): FormData | null {
    return this.apiPayload();
  }
}
