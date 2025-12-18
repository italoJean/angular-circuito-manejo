import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators,NonNullableFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VehiculoService } from '../../services/vehiculo.service';
import { Vehiculo } from '../../model/vehiculo.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { EstadoVehiculosEnum } from '../../enums/estado-vehiculo.enum';
import { TipoTransmisionEnum } from '../../enums/tipo-transmision.enum';

@Component({
  selector: 'app-vehiculo-form',
  imports: [ MaterialModule, ReactiveFormsModule],
  templateUrl: './vehiculo-form.html',
  styleUrl: './vehiculo-form.scss',
})
export class VehiculoForm implements OnInit {
  form!: FormGroup;
  isEditing = false;

// 🚩 CLAVE 1: Propiedades para hacer los Enums iterables 🚩
  public readonly estadoVehiculos = Object.values(EstadoVehiculosEnum);
  public readonly tiposTransmision = Object.values(TipoTransmisionEnum);

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VehiculoForm>);
  private readonly vehiculoService = inject(VehiculoService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data?: Vehiculo
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id],
      placa: [this.data?.placa || '', Validators.required],
      marca: [this.data?.marca || '', Validators.required],
      modelo: [this.data?.modelo || '', Validators.required],
      // Inicializa con el primer valor del enum si no hay datos
      tipoTransmision: [this.data?.tipoTransmision || '', Validators.required], 
      // estado: [this.data?.estado || '', Validators.required],
      // 👇 solo se usa para edición; al crear, se asigna por defecto
      estado: [this.data?.estado || EstadoVehiculosEnum.DISPONIBLE],

    });

    this.isEditing = !!this.data;

  }

  save(): void {
    if (this.form.invalid) return;

    const vehiculo = this.form.value as Vehiculo;

    const request$ = this.isEditing
      ? this.vehiculoService.update(vehiculo.id!, vehiculo)
      : this.vehiculoService.create(vehiculo);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Error al guardar vehiculo:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
