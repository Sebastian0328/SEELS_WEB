import { TestBed } from '@angular/core/testing';

import { EnviodataService } from './enviodata.service';

describe('EnviodataService', () => {
  let service: EnviodataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnviodataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
