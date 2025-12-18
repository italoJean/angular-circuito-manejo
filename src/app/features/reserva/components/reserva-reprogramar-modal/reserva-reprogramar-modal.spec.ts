import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaReprogramarModal } from './reserva-reprogramar-modal';

describe('ReservaReprogramarModal', () => {
  let component: ReservaReprogramarModal;
  let fixture: ComponentFixture<ReservaReprogramarModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaReprogramarModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaReprogramarModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
