import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  log(...args: any[]): void {
    if (!environment.production) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (!environment.production) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (!environment.production) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    // Usually we KEEP errors in production
    console.error(...args);
  }
}
