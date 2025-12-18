import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaMinutosModal } from './reserva-minutos-modal';

describe('ReservaMinutosModal', () => {
  let component: ReservaMinutosModal;
  let fixture: ComponentFixture<ReservaMinutosModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaMinutosModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaMinutosModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
