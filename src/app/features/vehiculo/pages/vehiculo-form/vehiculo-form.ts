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



  
  /**
   * 🚩 Lógica Dinámica de Estados:
   * - Si es DISPONIBLE, muestra [DISPONIBLE, MANTENIMIENTO].
   * - Si es MANTENIMIENTO, muestra [MANTENIMIENTO, DISPONIBLE].
   * - Nunca muestra RESERVADO como opción elegible.
   */
  get opcionesEstado(): string[] {
    const estadoActual = this.data?.estado;
    
    if (this.isEditing) {
      if (estadoActual === EstadoVehiculosEnum.DISPONIBLE) {
        return [EstadoVehiculosEnum.DISPONIBLE, EstadoVehiculosEnum.MANTENIMIENTO];
      }
      if (estadoActual === EstadoVehiculosEnum.MANTENIMIENTO) {
        return [EstadoVehiculosEnum.MANTENIMIENTO, EstadoVehiculosEnum.DISPONIBLE];
      }
      // Si por alguna razón está RESERVADO, solo mostramos su estado actual (estará deshabilitado)
      return [estadoActual!];
    }
    
    return [EstadoVehiculosEnum.DISPONIBLE];
  }



  ngOnInit(): void {
    this.isEditing = !!this.data;
    const estadoInicial = this.data?.estado || EstadoVehiculosEnum.DISPONIBLE;

    this.form = this.fb.group({
      id: [this.data?.id],
      placa: [this.data?.placa || '', Validators.required],
      marca: [this.data?.marca || '', Validators.required],
      modelo: [this.data?.modelo || '', Validators.required],
      tipoTransmision: [this.data?.tipoTransmision || '', Validators.required],
      estado: [estadoInicial]
    });

    /**
     * 🚩 Bloqueo de Control:
     * El estado solo se puede editar si NO es RESERVADO.
     */
    if (this.isEditing && estadoInicial === EstadoVehiculosEnum.RESERVADO) {
      this.form.get('estado')?.disable();
    }
  }


  save(): void {
    if (this.form.invalid) return;

    // const vehiculo = this.form.value as Vehiculo;
    const vehiculo = this.form.getRawValue() as Vehiculo;

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
