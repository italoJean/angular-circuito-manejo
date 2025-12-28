import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VehiculoService } from '../../services/vehiculo.service';
import { Vehiculo } from '../../model/vehiculo.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { EstadoVehiculosEnum } from '../../enums/estado-vehiculo.enum';
import { TipoTransmisionEnum } from '../../enums/tipo-transmision.enum';
import { NotificacionService } from '../../../../shared/services/notificacion.service';

@Component({
  selector: 'app-vehiculo-form',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './vehiculo-form.html',
  styleUrl: './vehiculo-form.scss',
})
export class VehiculoForm implements OnInit {
  form!: FormGroup;
  isEditing = false;
  loading = false; // Control para el spinner y bloqueo de doble clic

  // Los Enums se convierten en Arrays para usarlos en el *ngFor o @for del HTML
  public readonly tiposTransmision = Object.values(TipoTransmisionEnum);

  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VehiculoForm>);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly _notificacionService = inject(NotificacionService);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: Vehiculo) {}

  ngOnInit(): void {
    this.isEditing = !!this.data;
    const estadoInicial = this.data?.estado || EstadoVehiculosEnum.DISPONIBLE;

    // Deben ser idénticas a las del DTO en Java (@Size, @Pattern, etc.)
    this.form = this.fb.group({
      id: [this.data?.id],
      placa: [
        this.data?.placa || '',
        [
          Validators.required,
          Validators.pattern('[A-Z0-9-]{6,10}'), // Obliga formato alfanumérico con guion
          Validators.maxLength(10),
        ],
      ],
      marca: [this.data?.marca || '', [Validators.required, Validators.maxLength(50)]],
      modelo: [this.data?.modelo || '', [Validators.required, Validators.maxLength(50)]],
      tipoTransmision: [this.data?.tipoTransmision || '', [Validators.required]],
      estado: [estadoInicial],
    });

    // AUTO-MAYÚSCULAS: Mejora la UX al normalizar la entrada antes de validar el pattern
    this.form.get('placa')?.valueChanges.subscribe((val) => {
      if (val) this.form.get('placa')?.patchValue(val.toUpperCase(), { emitEvent: false });
    });

    // Si el vehículo está reservado, el estado NO se toca (evita inconsistencias)
    if (this.isEditing && estadoInicial === EstadoVehiculosEnum.RESERVADO) {
      this.form.get('estado')?.disable();
    }
  }

  // Define qué estados puede elegir el usuario según el estado actual
  get opcionesEstado(): string[] {
    const estadoActual = this.data?.estado;
    if (this.isEditing) {
      if (estadoActual === EstadoVehiculosEnum.DISPONIBLE)
        return [EstadoVehiculosEnum.DISPONIBLE, EstadoVehiculosEnum.MANTENIMIENTO];
      if (estadoActual === EstadoVehiculosEnum.MANTENIMIENTO)
        return [EstadoVehiculosEnum.MANTENIMIENTO, EstadoVehiculosEnum.DISPONIBLE];
      return [estadoActual!];
    }
    return [EstadoVehiculosEnum.DISPONIBLE];
  }

  // Centraliza los mensajes para que el HTML no crezca
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('pattern')) return 'Formato inválido (ej: ABC-123)';
    if (control.hasError('maxlength')) {
      const limit = control.errors['maxlength'].requiredLength;
      return `Máximo ${limit} caracteres`;
    }
    // SERVER ERROR: Captura errores que vienen del backend después del submit (ej: Placa duplicada)
    if (control.hasError('serverError')) return control.getError('serverError');

    return 'Campo inválido';
  }

  save(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    // getRawValue(): Obtiene datos incluyendo campos disabled (importante para el ID y Estado)
    const vehiculo = this.form.getRawValue() as Vehiculo;

    const request$ = this.isEditing
      ? this.vehiculoService.update(vehiculo.id!, vehiculo)
      : this.vehiculoService.create(vehiculo);

    request$.subscribe({
      next: (res) => {
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.loading = false; // Libera el botón para que el usuario pueda corregir
        this.handleBackendError(err);
      },
    });
  }

  /**
   * MANEJO DE ERRORES BACKEND (HTTP 400):
   * Procesa la lista 'detalles' que envía Spring Boot y asigna los errores
   * directamente a cada input del formulario.
   */
  private handleBackendError(err: any): void {
    const errorBody = err.error;

    if (err.status === 400 && errorBody?.detalles) {
      errorBody.detalles.forEach((detalle: string) => {
        // Esperamos formato "nombreCampo: mensaje"
        const [campo, ...mensajeParts] = detalle.split(': ');
        const mensaje = mensajeParts.join(': ');
        const control = this.form.get(campo.trim());

        if (control) {
          control.setErrors({ serverError: mensaje }); // Marcamos el input como inválido
          control.markAsTouched(); // Forzamos a que se ponga rojo
        }
      });
      this._notificacionService.error('Hay errores en los datos ingresados');
    } else {
      // Error genérico (BusinessException o 500)
      this._notificacionService.error(errorBody?.mensaje || 'Error inesperado en el servidor');
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
