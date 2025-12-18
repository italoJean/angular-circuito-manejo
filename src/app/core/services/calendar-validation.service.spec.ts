import { TestBed } from '@angular/core/testing';

import { CalendarValidationService } from './calendar-validation.service';

describe('CalendarValidationService', () => {
  let service: CalendarValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
