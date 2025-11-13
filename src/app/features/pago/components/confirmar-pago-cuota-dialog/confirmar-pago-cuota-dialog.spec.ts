import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarPagoCuotaDialog } from './confirmar-pago-cuota-dialog';

describe('ConfirmarPagoCuotaDialog', () => {
  let component: ConfirmarPagoCuotaDialog;
  let fixture: ComponentFixture<ConfirmarPagoCuotaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarPagoCuotaDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarPagoCuotaDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
