import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-eemaregcomplete',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, RouterLink, MatIcon, MatButtonModule],
  templateUrl: './eemaregcomplete.html',
  styleUrl: './eemaregcomplete.scss',
})
export class Eemaregcomplete implements OnInit {
  data = signal<any>(null);
  registration = computed(() => this.data()?.registration);
  payment = computed(() => this.data()?.payment);

  constructor(private router: Router) { }

  ngOnInit() {
    const saved = sessionStorage.getItem('emmaRegSuccess');

    if (!saved) {
      this.router.navigate(['/eema-registration']);
      return;
    }

    this.data.set(JSON.parse(saved));
  }
}
