import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculoList } from './vehiculo-list';

describe('VehiculoList', () => {
  let component: VehiculoList;
  let fixture: ComponentFixture<VehiculoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculoList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculoList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
