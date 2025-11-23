import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullCalendar } from './full-calendar';

describe('FullCalendar', () => {
  let component: FullCalendar;
  let fixture: ComponentFixture<FullCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
