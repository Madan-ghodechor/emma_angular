import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Eemaregcomplete } from './eemaregcomplete';

describe('Eemaregcomplete', () => {
  let component: Eemaregcomplete;
  let fixture: ComponentFixture<Eemaregcomplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eemaregcomplete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Eemaregcomplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
