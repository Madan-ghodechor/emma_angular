import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetryPayment } from './retry-payment';

describe('RetryPayment', () => {
  let component: RetryPayment;
  let fixture: ComponentFixture<RetryPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetryPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetryPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
