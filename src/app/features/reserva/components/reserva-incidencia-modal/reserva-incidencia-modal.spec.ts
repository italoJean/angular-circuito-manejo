import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaIncidenciaModal } from './reserva-incidencia-modal';

describe('ReservaIncidenciaModal', () => {
  let component: ReservaIncidenciaModal;
  let fixture: ComponentFixture<ReservaIncidenciaModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaIncidenciaModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaIncidenciaModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
