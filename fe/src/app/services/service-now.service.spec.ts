import { TestBed } from '@angular/core/testing';

import { ServiceNowService } from './service-now.service';

describe('ServiceNowService', () => {
  let service: ServiceNowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceNowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
