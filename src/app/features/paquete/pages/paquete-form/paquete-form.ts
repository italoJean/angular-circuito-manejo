import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaqueteService } from '../../services/paquete.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Paquete } from '../../model/paquete.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { NotificacionService } from '../../../../shared/services/notificacion.service';

@Component({
  selector: 'app-paquete-form',
  imports: [ ReactiveFormsModule, MaterialModule],
  templateUrl: './paquete-form.html',
  styleUrl: './paquete-form.scss',
})
export class PaqueteForm implements OnInit {
  form!: FormGroup;
  isEditing = false;
  loading = false;
  isHours = false; // Estado del toggle
  isDuracionBloqueada = false; // Bloqueo por integridad referencial (Pagos)

  private readonly _paqueteService = inject(PaqueteService);
  private readonly _fb = inject(FormBuilder);
  private readonly _dialogRef = inject(MatDialogRef<PaqueteForm>);
  private readonly _notificacionService = inject(NotificacionService);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: Paquete) {}

  ngOnInit(): void {
    this.isEditing = !!this.data;

    this.form = this._fb.group({
      id: [this.data?.id],
      // VALIDACIÓN ESPEJO: @Size(max=100) y @NotBlank
      nombre: [this.data?.nombre || '', [Validators.required, Validators.maxLength(100)]],
      // @Size(max=1000)
      descripcion: [this.data?.descripcion || '', [Validators.maxLength(1000)]],
      // @Min(30) y @NotNull
      duracionMinutos: [this.data?.duracionMinutos || '', [Validators.required, Validators.min(30)]],
      duracionHoras: [''],
      // @Digits(fraction=2) y @Min(0)
      precioTotal: [this.data?.precioTotal || '', [
        Validators.required, 
        Validators.min(0),
        Validators.pattern(/^\d+(\.\d{1,2})?$/) // Asegura max 2 decimales
      ]],
    });

    // Si el paquete tiene pagos, no se puede alterar el tiempo 
    if (this.isEditing && this.data?.id) {
      this._paqueteService.tienePagos(this.data.id).subscribe({
        next: (tienePagos) => {
          this.isDuracionBloqueada = tienePagos;
          if (tienePagos) {
            this.form.get('duracionMinutos')?.disable();
            this.form.get('duracionHoras')?.disable();
          }
        }
      });
    }
  }

  // Mantiene sincronizados los minutos con las horas sin romper la validación.
  toggleMode(): void {
    if (this.isDuracionBloqueada) return;
    this.isHours = !this.isHours;

    const controlMin = this.form.get('duracionMinutos');
    const controlHor = this.form.get('duracionHoras');

    if (this.isHours) {
      if (controlMin?.value) controlHor?.setValue(controlMin.value / 60);
      controlMin?.clearValidators();
      controlHor?.setValidators([Validators.required, Validators.min(0.5)]); // 0.5h = 30min
    } else {
      if (controlHor?.value) controlMin?.setValue(controlHor.value * 60);
      controlHor?.clearValidators();
      controlMin?.setValidators([Validators.required, Validators.min(30)]);
    }
    
    controlMin?.updateValueAndValidity();
    controlHor?.updateValueAndValidity();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control?.errors) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('min')) {
      const min = control.errors['min'].min;
      return `Mínimo valor permitido: ${min}`;
    }
    if (control.hasError('maxlength')) return 'Supera el límite de caracteres';
    if (control.hasError('pattern')) return 'Máximo 2 decimales permitidos';
    if (control.hasError('serverError')) return control.getError('serverError');

    return 'Campo inválido';
  }

  save(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    // getRawValue(): Crucial para enviar duracionMinutos incluso si está disabled
    let paquete = this.form.getRawValue();

    // Normalización: El backend solo entiende minutos
    if (this.isHours && !this.isDuracionBloqueada) {
      paquete.duracionMinutos = Math.round(paquete.duracionHoras * 60);
    }
    delete paquete.duracionHoras;

    const request$ = this.isEditing
      ? this._paqueteService.update(paquete.id, paquete)
      : this._paqueteService.create(paquete);

    request$.subscribe({
      next: (res) => {
        this._dialogRef.close(res);
      },
      error: (err) => {
        this.loading = false;
        this.handleBackendError(err);
      }
    });
  }

  private handleBackendError(err: any): void {
    if (err.status === 400 && err.error?.detalles) {
      err.error.detalles.forEach((detalle: string) => {
        const [campo, ...mensajeParts] = detalle.split(': ');
        const mensaje = mensajeParts.join(': ');
        this.form.get(campo.trim())?.setErrors({ serverError: mensaje });
      });
      this._notificacionService.error('Corrija los errores marcados');
    } else {
      this._notificacionService.error(err.error?.mensaje || 'Error al procesar');
    }
  }

  close(): void { this._dialogRef.close(); }
}