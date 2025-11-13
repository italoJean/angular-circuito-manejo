import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaqueteForm } from './paquete-form';

describe('PaqueteForm', () => {
  let component: PaqueteForm;
  let fixture: ComponentFixture<PaqueteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaqueteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaqueteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
