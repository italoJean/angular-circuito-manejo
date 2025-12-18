import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaDetalleModal } from './reserva-detalle-modal';

describe('ReservaDetalleModal', () => {
  let component: ReservaDetalleModal;
  let fixture: ComponentFixture<ReservaDetalleModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaDetalleModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaDetalleModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
