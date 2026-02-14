import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessValidation } from './process-validation';

describe('ProcessValidation', () => {
  let component: ProcessValidation;
  let fixture: ComponentFixture<ProcessValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessValidation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
