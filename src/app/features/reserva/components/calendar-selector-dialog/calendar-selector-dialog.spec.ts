import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSelectorDialog } from './calendar-selector-dialog';

describe('CalendarSelectorDialog', () => {
  let component: CalendarSelectorDialog;
  let fixture: ComponentFixture<CalendarSelectorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarSelectorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarSelectorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
