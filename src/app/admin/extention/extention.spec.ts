import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Extention } from './extention';

describe('Extention', () => {
  let component: Extention;
  let fixture: ComponentFixture<Extention>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Extention]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Extention);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
