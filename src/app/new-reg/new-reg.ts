
import { Component, signal, effect, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { State } from '../service/state';
import { CurrencyPipe } from '@angular/common';
import { Location } from '@angular/common';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-new-reg',
  imports: [
    CurrencyPipe,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
],
  templateUrl: './new-reg.html',
  styleUrl: './new-reg.scss',
})
export class NewReg {


  ticketCount = signal(0);
  expandedIndex = signal<number | null>(0);

  forms = signal<FormGroup[]>([]);
  completed = signal<boolean[]>([]);

  constructor(private fb: FormBuilder, public booking: State, private location: Location) {
    effect(() => {
      const singles = this.booking.singleRooms();
      const doubles = this.booking.doubleRooms();
      const triples = this.booking.tripleRooms();

      const newForms: FormGroup[] = [];

      // Single rooms → 1 attendee each
      for (let i = 0; i < singles; i++) {
        newForms.push(this.createForm('single'));
      }

      // Double rooms → 2 attendees each
      for (let i = 0; i < doubles * 2; i++) {
        newForms.push(this.createForm('double'));
      }

      // Triple rooms → 3 attendees each
      for (let i = 0; i < triples * 3; i++) {
        newForms.push(this.createForm('triple'));
      }

      this.forms.set(newForms);
      this.completed.set(Array(newForms.length).fill(false));
    });
  }
  private createForm(roomType: 'single' | 'double' | 'triple'): FormGroup {
    return this.fb.group({
      roomType: [roomType],
      id: crypto.randomUUID(),

      firstName: ['Madan', Validators.required],
      lastName: ['Ghodechor', Validators.required],
      organisation: ['BAI INFO', Validators.required],
      email: ['madan.ghodechor@cotrav.co', Validators.required],
      phone: ['9309804106'],
      country: ['India', Validators.required],
      state: ['Maharashtra', Validators.required],
      city: ['Pune', Validators.required],
      gst: ['27DNRPG5170A1M'],
    });
  }
  activeRoomType = signal<'single' | 'double' | 'triple'>('single');

  filteredForms = computed(() => {
    const type = this.activeRoomType();
    return this.forms().filter(
      f => f.get('roomType')?.value === type
    );
  });




  next(index: number) {
    const form = this.forms()[index];

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    // mark completed
    this.completed.update(arr => {
      const copy = [...arr];
      copy[index] = true;
      return copy;
    });

    // open next
    if (index + 1 < this.forms().length) {
      this.expandedIndex.set(index + 1);
    } else {
      this.expandedIndex.set(null);
    }
  }

  edit(index: number) {
    this.expandedIndex.set(index);
  }

  allValid(): boolean {
    return this.forms().every(form => form.valid);
  }
  allCollapsed(): boolean {
    return this.expandedIndex() === null;
  }

  submit() {
    if (!this.allValid()) {
      this.forms().forEach(form => form.markAllAsTouched());
      return;
    }

    const payload = {
      attendees: this.forms().map(form => form.getRawValue()),
      ticketCount: this.ticketCount()
    };

    console.log('Submitting payload:', payload);

    // Example: send to service / API
    // this.bookingService.submit(payload);

    // Navigate next
    // this.router.navigate(['/payment']);
  }


  open(index: number) {
    this.expandedIndex.set(index);
  }

  isOpen(index: number) {
    return this.expandedIndex() === index;
  }

  isCompleted(index: number) {
    return this.completed()[index];
  }
  goBack() {
    this.location.back();
  }
}

