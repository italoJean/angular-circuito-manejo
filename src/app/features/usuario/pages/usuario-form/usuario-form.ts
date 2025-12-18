import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../model/usuario.model';
import { TipoDocumentoEnum } from '../../enums/tipo-documento.enum';
import { MaterialModule } from "../../../../shared/ui/material-module";

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, FormsModule, MaterialModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm implements OnInit {
  form!: FormGroup;
  isEditing = false;

  private readonly fb=inject(FormBuilder);
  private readonly dialogRef=inject(MatDialogRef<UsuarioForm>);
  private readonly usuarioService=inject(UsuarioService);

  
    public readonly tipoDocumentos = Object.values(TipoDocumentoEnum);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data?: Usuario
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id],
      nombre: [this.data?.nombre || '', Validators.required],
      apellido: [this.data?.apellido || '', Validators.required],
      tipoDocumento: [this.data?.tipoDocumento || '', Validators.required],
      numeroDocumento: [this.data?.numeroDocumento || '', Validators.required],
      telefono: [this.data?.telefono || '', Validators.required],
      email: [this.data?.email || '', Validators.required]
    });

    this.isEditing = !!this.data;
  }

  save(): void {
    if (this.form.invalid) return;

    const usuario = this.form.value as Usuario;

    const request$ = this.isEditing
      ? this.usuarioService.update(usuario.id!, usuario)
      : this.usuarioService.create(usuario);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Error al guardar usuario:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
