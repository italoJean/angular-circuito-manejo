import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaqueteService } from '../../services/paquete.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Paquete } from '../../model/paquete.model';
import { MaterialModule } from "../../../../shared/ui/material-module";

@Component({
  selector: 'app-paquete-form',
  imports: [MatDialogContent, MaterialModule, MatDialogActions,ReactiveFormsModule],
  templateUrl: './paquete-form.html',
  styleUrl: './paquete-form.scss',
})
export class PaqueteForm implements OnInit {
  form!: FormGroup;
  isEditing = false;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PaqueteForm>,
    private paqueteService: PaqueteService,
    @Inject(MAT_DIALOG_DATA) public data?: Paquete
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id],
      nombre: [this.data?.nombre || '', Validators.required],
      descripcion: [this.data?.descripcion || ''],
      duracionMinutos: [this.data?.duracionMinutos || '', Validators.required],
      precioTotal: [this.data?.precioTotal || '', Validators.required],
    });

    this.isEditing = !!this.data;
  }

  save(): void {
    if (this.form.invalid) return;

    const paquete = this.form.value as Paquete;

    const request$ = this.isEditing
      ? this.paqueteService.update(paquete.id!, paquete)
      : this.paqueteService.create(paquete);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Error al guardar paquete:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}