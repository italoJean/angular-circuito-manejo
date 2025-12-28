import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../model/usuario.model';
import { TipoDocumentoEnum } from '../../enums/tipo-documento.enum';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { NotificacionService } from '../../../../shared/services/notificacion.service';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, FormsModule, MaterialModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm implements OnInit {
  form!: FormGroup;
  isEditing = false;
  loading = false; // Evita doble envío y permite mostrar el spinner

  // Dependencias inyectadas con patrón moderno
  private readonly _fb = inject(FormBuilder);
  private readonly _dialogRef = inject(MatDialogRef<UsuarioForm>);
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _notificacionService = inject(NotificacionService);

  // Lista de tipos de documento desde el Enum
  public readonly tipoDocumentos = Object.values(TipoDocumentoEnum);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: Usuario) {}

  ngOnInit(): void {
    this.isEditing = !!this.data;

    this.form = this._fb.group({
      id: [this.data?.id],
      // @Size(max = 50) y @NotBlank
      nombre: [this.data?.nombre || '', [
        Validators.required, 
        Validators.maxLength(50)
      ]],
      // @Size(max = 50) y @NotBlank
      apellido: [this.data?.apellido || '', [
        Validators.required, 
        Validators.maxLength(50)
      ]],
      // @NotNull
      tipoDocumento: [this.data?.tipoDocumento || '', Validators.required],
      // @Size(max = 20) y @NotBlank
      numeroDocumento: [this.data?.numeroDocumento || '', [
        Validators.required, 
        Validators.maxLength(20),
      Validators.pattern('^[0-9]{20}$') // Solo permite dígitos del 0 al 9
      ]],
      telefono: [this.data?.telefono || '', [
        Validators.required, 
        Validators.pattern('^[0-9]{9}$')
      ]],
      // @Email y @NotBlank
      email: [this.data?.email || '', [
        Validators.required, 
        Validators.email
      ]]
    });
  }

  // CENTRALIZADOR DE ERRORES
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('maxlength')) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.hasError('email')) return 'Formato de correo inválido';
    // MENSAJES PERSONALIZADOS PARA LOS PATTERNS
  if (control.hasError('pattern')) {
    if (controlName === 'numeroDocumento') return 'Solo se permiten números';
    if (controlName === 'telefono') return 'El teléfono debe tener 9 dígitos';
  }
    if (control.hasError('serverError')) return control.getError('serverError');

    return 'Campo inválido';
  }

  save(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    const usuario = this.form.value;

    const request$ = this.isEditing
      ? this._usuarioService.update(usuario.id!, usuario)
      : this._usuarioService.create(usuario);

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
    // Si el backend responde con 400 (Validation Error) de Spring Boot
    if (err.status === 400 && err.error?.detalles) {
      err.error.detalles.forEach((detalle: string) => {
        const [campo, ...mensajeParts] = detalle.split(': ');
        const mensaje = mensajeParts.join(': ');
        this.form.get(campo.trim())?.setErrors({ serverError: mensaje });
      });
      this._notificacionService.error('Corrija los errores marcados');
    } else {
      this._notificacionService.error(err.error?.mensaje || 'Error de conexión');
    }
  }

  close(): void { this._dialogRef.close(); }
}