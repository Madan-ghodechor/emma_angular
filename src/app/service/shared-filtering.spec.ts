import { TestBed } from '@angular/core/testing';

import { SharedFiltering } from './shared-filtering';

describe('SharedFiltering', () => {
  let service: SharedFiltering;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedFiltering);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
