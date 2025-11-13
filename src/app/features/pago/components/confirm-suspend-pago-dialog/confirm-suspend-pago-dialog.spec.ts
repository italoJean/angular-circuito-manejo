import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSuspendPagoDialog } from './confirm-suspend-pago-dialog';

describe('ConfirmSuspendPagoDialog', () => {
  let component: ConfirmSuspendPagoDialog;
  let fixture: ComponentFixture<ConfirmSuspendPagoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmSuspendPagoDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmSuspendPagoDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
