import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCompany } from './bulk-company';

describe('BulkCompany', () => {
  let component: BulkCompany;
  let fixture: ComponentFixture<BulkCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkCompany);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
