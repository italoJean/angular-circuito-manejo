import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaqueteService } from '../../services/paquete.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Paquete } from '../../model/paquete.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paquete-form',
  imports: [ ReactiveFormsModule,CommonModule, MaterialModule],
  templateUrl: './paquete-form.html',
  styleUrl: './paquete-form.scss',
})
export class PaqueteForm implements OnInit {

  form!: FormGroup;
  isEditing = false;
  isHours = false;

  private readonly paqueteService = inject(PaqueteService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PaqueteForm>);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: Paquete) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [this.data?.id],
      nombre: [this.data?.nombre || '', Validators.required],
      descripcion: [this.data?.descripcion || ''], 

      // por defecto minutos
      duracionMinutos: [this.data?.duracionMinutos || '', Validators.required],
      duracionHoras: [''],

      precioTotal: [this.data?.precioTotal || '', Validators.required],
    });

    this.isEditing = !!this.data;
  }

  // Cambiar entre MINUTOS ↔ HORAS
  toggleMode(): void {
    this.isHours = !this.isHours;

    if (this.isHours) {
      // pasar minutos a horas
      const mins = this.form.get('duracionMinutos')?.value;
      if (mins) this.form.patchValue({ duracionHoras: mins / 60 });

      // deshabilitar validación de minutos
      this.form.get('duracionMinutos')?.clearValidators();
      this.form.get('duracionMinutos')?.updateValueAndValidity();

      // activar validación en horas
      this.form.get('duracionHoras')?.setValidators([Validators.required]);
      this.form.get('duracionHoras')?.updateValueAndValidity();
    } else {
      // pasar horas a minutos
      const hours = this.form.get('duracionHoras')?.value;
      if (hours) this.form.patchValue({ duracionMinutos: hours * 60 });

      // deshabilitar validación en horas
      this.form.get('duracionHoras')?.clearValidators();
      this.form.get('duracionHoras')?.updateValueAndValidity();

      // reactivar validación de minutos
      this.form.get('duracionMinutos')?.setValidators([Validators.required]);
      this.form.get('duracionMinutos')?.updateValueAndValidity();
    }
  }

  save(): void {
    if (this.form.invalid) return;

    let paquete = this.form.value as any;

    // Convertir siempre a minutos antes de guardar
    if (this.isHours) {
      paquete.duracionMinutos = paquete.duracionHoras * 60;
    }

    delete paquete.duracionHoras;

    const request$ = this.isEditing
      ? this.paqueteService.update(paquete.id, paquete)
      : this.paqueteService.create(paquete);

    request$.subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Error al guardar paquete', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
