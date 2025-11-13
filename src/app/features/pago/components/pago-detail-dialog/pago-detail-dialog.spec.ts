import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoDetailDialog } from './pago-detail-dialog';

describe('PagoDetailDialog', () => {
  let component: PagoDetailDialog;
  let fixture: ComponentFixture<PagoDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoDetailDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoDetailDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
