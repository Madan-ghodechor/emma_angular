import { computed, Injectable, signal, effect } from '@angular/core';

type RoomType = 'single' | 'double' ;
// 'triple';

@Injectable({ providedIn: 'root' })
export class State {

  /* ---------------- Prices ---------------- */
  readonly singlePrice = signal(9500);
  readonly doublePrice = signal(11500);
  // readonly triplePrice = signal(12750);

  /* ---------------- Room counts ---------------- */
  public readonly singleCount = signal(0);
  public readonly doubleCount = signal(0);
  // public readonly tripleCount = signal(0);

  readonly singleRooms = this.singleCount.asReadonly();
  readonly doubleRooms = this.doubleCount.asReadonly();
  // readonly tripleRooms = this.tripleCount.asReadonly();

  /* ---------------- Derived ---------------- */
  readonly totalAttendees = computed(() =>
    this.singleRooms() * 1 +
    this.doubleRooms() * 2 
    // +
    // this.tripleRooms() * 3
  );

  readonly totalPrice = computed(() =>
    this.singleRooms() * this.singlePrice() +
    this.doubleRooms() * this.doublePrice() 
    // +
    // this.tripleRooms() * this.triplePrice()
  );
  readonly totalPricewithGST = computed(() =>
  (this.singleRooms() * this.singlePrice() +
    this.doubleRooms() * this.doublePrice() 
    // +
    // this.tripleRooms() * this.triplePrice()
  ) *1.18
  );

  constructor() {
    this.restore();
    this.persist();
  }

  /* ---------------- Controls ---------------- */
  increase(type: RoomType) {
    this.getSignal(type).update(v => v + 1);
  }

  decrease(type: RoomType) {
    this.getSignal(type).update(v => Math.max(0, v - 1));
  }

  private getSignal(type: RoomType) {
    switch (type) {
      case 'single': return this.singleCount;
      case 'double': return this.doubleCount;
      // case 'triple': return this.tripleCount;
    }
  }

  /* ---------------- Persistence ---------------- */
  private persist() {
    effect(() => {
      const data = {
        single: this.singleCount(),
        double: this.doubleCount(),
        // triple: this.tripleCount()
      };

      sessionStorage.setItem(
        'booking_room_counts_v1',
        JSON.stringify(data)
      );
    });
  }

  public restore() {
    const raw = sessionStorage.getItem('booking_room_counts_v1');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      this.singleCount.set(parsed.single ?? 0);
      this.doubleCount.set(parsed.double ?? 0);
      // this.tripleCount.set(parsed.triple ?? 0);

      const primaryUser = JSON.parse(sessionStorage.getItem('primaryUser') || '{}');
      const email = primaryUser.email;
      const phone = primaryUser.phone;
      
      this.emailSet.set(new Set([email]));
      this.phoneSet.set(new Set([phone]));
    } catch {
      sessionStorage.removeItem('booking_room_counts_v1');
    }
  }

  /* ---------------- Reset ---------------- */
  reset() {
    this.singleCount.set(0);
    this.doubleCount.set(0);
    // this.tripleCount.set(0);
    sessionStorage.removeItem('booking_room_counts_v1');
  }








  /* ---------------- For Testing ---------------- */
  emailSet = signal<Set<string>>(new Set());
  phoneSet = signal<Set<string>>(new Set());


  generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


}
