import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDynamics } from './add-dynamics';

describe('AddDynamics', () => {
  let component: AddDynamics;
  let fixture: ComponentFixture<AddDynamics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDynamics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDynamics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
