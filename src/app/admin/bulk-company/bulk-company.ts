import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Api } from '../services/api';

@Component({
  selector: 'app-bulk-company',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bulk-company.html',
  styleUrl: './bulk-company.scss',
})
export class BulkCompany {
  private api = inject(Api);

  selectedFile = signal<File | null>(null);
  fileError = signal('');
  uploading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  get fileSizeLabel(): () => string {
    return () => {
      const file = this.selectedFile();
      if (!file) return '';
      const kb = file.size / 1024;
      return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
    };
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileError.set('');
    this.successMsg.set('');
    this.errorMsg.set('');

    if (!file) return;

    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const extValid = /\.(xlsx|xls)$/i.test(file.name);

    if (!allowed.includes(file.type) && !extValid) {
      this.fileError.set('Only .xlsx or .xls files are allowed.');
      this.selectedFile.set(null);
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.fileError.set('');
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  submit(): void {
    this.successMsg.set('');
    this.errorMsg.set('');

    if (!this.selectedFile()) {
      this.fileError.set('Please select an Excel file.');
      return;
    }

    const payload = new FormData();
    payload.append('file', this.selectedFile() as File);

    this.uploading.set(true);
    this.api.bulkUploadCompanies(payload).subscribe({
      next: () => {
        this.uploading.set(false);
        this.reset();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Companies imported successfully.',
          confirmButtonColor: '#4f46e5',
        });
      },
      error: (err: any) => {
        this.uploading.set(false);
        this.errorMsg.set(err?.error?.message || 'Upload failed. Please try again.');
      },
    });
  }

  reset(): void {
    this.selectedFile.set(null);
    this.fileError.set('');
  }
}
