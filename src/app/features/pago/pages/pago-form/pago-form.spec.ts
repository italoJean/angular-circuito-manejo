import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoForm } from './pago-form';

describe('PagoForm', () => {
  let component: PagoForm;
  let fixture: ComponentFixture<PagoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
