import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PagoService } from '../../services/pago.service';
import { PaqueteService } from '../../../paquete/services/paquete.service';
import { UsuarioService } from '../../../usuario/services/usuario.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { Usuario } from '../../../usuario/model/usuario.model';
import { Paquete } from '../../../paquete/model/paquete.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MetodoPagoEnum } from '../../enum/metodo-pago.enum';
import { TipoPagoEnum } from '../../enum/tipo-pago.enum';
import { PagoCuotasRequestDTO } from '../../model/pago-cuotas.request.model';
import { PagoContadoRequestDTO } from '../../model/pago-contado.request.model';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-pago-form',
  imports: [
    MatSlideToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './pago-form.html',
  styleUrl: './pago-form.scss',
})
export class PagoForm implements OnInit {

  private readonly fb=inject(FormBuilder);
  private readonly dialogRef=inject(MatDialogRef<PagoForm>);
  private readonly pagoService=inject(PagoService);
  private readonly paqueteService=inject(PaqueteService);
  private readonly usuarioService=inject(UsuarioService);
  private readonly notificacionService = inject(NotificacionService);


  constructor(
    @Inject(MAT_DIALOG_DATA) public data?: PagoCuotasRequestDTO | PagoContadoRequestDTO
  ) {}

  form!: FormGroup;
  isEditing = false;

  usuarios=signal<Usuario[]>([]);
  paquetes=signal<Paquete[]>([]);

  // Filtros dinámicos (signals)
  filtroUsuario = signal('');
  filtroPaquete = signal('');


    public readonly metodoPagos = Object.values(MetodoPagoEnum);
    // public readonly estados = Object.values(EstadoVehiculosEnum);


  ngOnInit(): void {
    this.form = this.fb.group({
      usuarioId: [this.data?.usuarioId || '', Validators.required],
      paqueteId: [this.data?.paqueteId || '', Validators.required],
      metodoPago: [this.data?.metodoPago || '', Validators.required],
      pagarEnCuotas: [false],
      cuotas: [ ''],
      montoPrimerPago: [''],
      
    // 🔥 Nuevo campo para controlar si es pago en cuotas
    pagoEnCuotas: [false], 

    });

    this.isEditing = !!this.data;

    this.loadUsuarios();
    this.loadPaquetes();

        // Control dinámico de validadores
    this.form.get('pagarEnCuotas')?.valueChanges.subscribe(value => {
      if (value) {
        this.form.get('cuotas')?.setValidators([Validators.required]);
        this.form.get('montoPrimerPago')?.setValidators([Validators.required]);
      } else {
        this.form.get('cuotas')?.clearValidators();
        this.form.get('montoPrimerPago')?.clearValidators();
        this.form.get('cuotas')?.reset();
        this.form.get('montoPrimerPago')?.reset();
      }

      this.form.get('cuotas')?.updateValueAndValidity();
      this.form.get('montoPrimerPago')?.updateValueAndValidity();
    });
  }

  // 🔹 Cargar usuarios
  loadUsuarios() {
    this.usuarioService.findAll().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => this.notificacionService.error('Error al cargar usuarios')
    });
  }

  // 🔹 Cargar paquetes
  loadPaquetes() {
    this.paqueteService.findAll().subscribe({
      next: (paquetes) => this.paquetes.set(paquetes),
      error: () => this.notificacionService.error('Error al cargar paquetes')
    });
  }

  // 🔹 Filtrado de usuario por nombre o DNI
  get usuariosFiltrados(): Usuario[] {
    const filtro = this.filtroUsuario().toLowerCase();
    return this.usuarios().filter(u =>
      u.nombre.toLowerCase().includes(filtro) ||
      u.numeroDocumento.toLowerCase().includes(filtro)
    );
  }

  // 🔹 Filtrado de paquetes
  get paquetesFiltrados(): Paquete[] {
    const filtro = this.filtroPaquete().toLowerCase();
    return this.paquetes().filter(p =>
      p.nombre.toLowerCase().includes(filtro)
    );
  }

  // save(): void {
  //   if (this.form.invalid) return;

  //   const pago = this.form.value as PagoRequest;

  //   const request$ = this.isEditing
  //     ? this.pagoService.update(pago.id!, pago)
  //     : this.pagoService.create(pago);

  //   request$.subscribe({
  //     next: (res) => this.dialogRef.close(res),
  //     error: (err) => console.error('Error al guardar pago:', err),
  //   });
  // }



  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usarCuotas = this.form.value.pagarEnCuotas;

    if (usarCuotas) {
      const request: PagoCuotasRequestDTO = {
        usuarioId: this.form.value.usuarioId,
        paqueteId: this.form.value.paqueteId,
        metodoPago: this.form.value.metodoPago,
        cuotas: this.form.value.cuotas,
        montoPrimerPago: this.form.value.montoPrimerPago
      };

      this.pagoService.createCuotas(request).subscribe(resp => {
        console.log("✅ Pago en cuotas creado:", resp);
      });

    } else {
      const request: PagoContadoRequestDTO = {
        usuarioId: this.form.value.usuarioId,
        paqueteId: this.form.value.paqueteId,
        metodoPago: this.form.value.metodoPago
      };

      this.pagoService.createContado(request).subscribe(resp => {
        console.log("✅ Pago al contado creado:", resp);
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
