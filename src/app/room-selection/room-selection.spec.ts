import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSelection } from './room-selection';

describe('RoomSelection', () => {
  let component: RoomSelection;
  let fixture: ComponentFixture<RoomSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomSelection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
