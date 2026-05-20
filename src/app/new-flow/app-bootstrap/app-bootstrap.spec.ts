import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBootstrap } from './app-bootstrap';

describe('AppBootstrap', () => {
  let component: AppBootstrap;
  let fixture: ComponentFixture<AppBootstrap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBootstrap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppBootstrap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
