import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryUser } from './primary-user';

describe('PrimaryUser', () => {
  let component: PrimaryUser;
  let fixture: ComponentFixture<PrimaryUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimaryUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimaryUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
