import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReg } from './new-reg';

describe('NewReg', () => {
  let component: NewReg;
  let fixture: ComponentFixture<NewReg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewReg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
