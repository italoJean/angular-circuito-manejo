import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReservaService } from '../../services/reserva.service';
import { EstadoReservaEnum } from '../../enum/estado-reserva.enum';
import { ReservaRequest } from '../../model/reserva-request.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../usuario/services/usuario.service';
import { PaqueteService } from '../../../paquete/services/paquete.service';
import {MatTimepickerModule} from '@angular/material/timepicker';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {provideNativeDateAdapter} from '@angular/material/core';
import { Usuario } from '../../model/usuario.model';
import { Paquete } from '../../model/paquete.model';
import { PagoService } from '../../../pago/services/pago.service';
import { VehiculoService } from '../../../vehiculo/services/vehiculo.service';
import { Vehiculo } from '../../../vehiculo/model/vehiculo.model';
import { CalendarSelectorDialog } from '../../../../shared/components/full-calendar/dialog/calendar-selector-dialog/calendar-selector-dialog';

@Component({
  selector: 'app-reserva-form',
  providers: [provideNativeDateAdapter()],
  imports: [
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
    MaterialModule
],
  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.scss',
})
export class ReservaForm implements OnInit {

  private readonly fb=inject(FormBuilder);
  private readonly dialogRef=inject(MatDialogRef<ReservaForm>);
  private readonly usuarioService=inject(UsuarioService);
  private readonly paqueteService=inject(PaqueteService);
  private readonly pagoService=inject(PagoService);
  private readonly vehiculoService=inject(VehiculoService);
  private readonly reservaService=inject(ReservaService);
  private readonly notificacionService = inject(NotificacionService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data?: ReservaRequest
  ) {}

  form!: FormGroup;
  isEditing = false;

  // usuarios=signal<Usuario[]>([]);
  // paquetes=signal<Paquete[]>([]);

  // // Filtros dinámicos (signals)
  // filtroUsuario = signal('');
  // filtroPaquete = signal('');

  pagos=signal<any[]>([]);           // Tipo del DTO de pagos
vehiculos=signal<Vehiculo[]>([]);

// Filtros dinámicos (signals)
filtroPago = signal('');
filtroVehiculo = signal('');

    public readonly tipoDocumentos = Object.values(EstadoReservaEnum);
    // public readonly estados = Object.values(EstadoVehiculosEnum);


  ngOnInit(): void {
    this.form = this.fb.group({
    pagoId: [this.data?.pagoId || '', Validators.required],
    vehiculoId: [this.data?.vehiculoId || '', Validators.required],
    fechaReserva: [this.data?.fechaReserva || '', Validators.required],
    minutosReservados: [this.data?.minutosReservados || '', [Validators.required, Validators.min(1)]]
  });

  this.isEditing = !!this.data;

  // Ya no necesitas cargar usuarios/paquetes; ahora cargas pagos y vehículos
  this.loadPagos();
  this.loadVehiculos();
  }

  // // 🔹 Cargar usuarios
  // loadUsuarios() {
  //   this.usuarioService.findAll().subscribe({
  //     next: (usuarios) => this.usuarios.set(usuarios),
  //     error: () => this.notificacionService.error('Error al cargar usuarios')
  //   });
  // }

  // // 🔹 Cargar paquetes
  // loadPaquetes() {
  //   this.paqueteService.findAll().subscribe({
  //     next: (paquetes) => this.paquetes.set(paquetes),
  //     error: () => this.notificacionService.error('Error al cargar paquetes')
  //   });
  // }

  // // 🔹 Filtrado de usuario por nombre o DNI
  // get usuariosFiltrados(): Usuario[] {
  //   const filtro = this.filtroUsuario().toLowerCase();
  //   return this.usuarios().filter(u =>
  //     u.nombre.toLowerCase().includes(filtro) ||
  //     u.numeroDocumento.toLowerCase().includes(filtro)
  //   );
  // }

  // // 🔹 Filtrado de paquetes
  // get paquetesFiltrados(): Paquete[] {
  //   const filtro = this.filtroPaquete().toLowerCase();
  //   return this.paquetes().filter(p =>
  //     p.nombre.toLowerCase().includes(filtro)
  //   );
  // }


// 🔹 Cargar pagos (reemplaza loadUsuarios)
loadPagos() {
  this.pagoService.findAll().subscribe({
    next: (pagos) => this.pagos.set(pagos),
    error: () => this.notificacionService.error('Error al cargar pagos')
  });
}

// 🔹 Cargar vehículos (reemplaza loadPaquetes)
loadVehiculos() {
  this.vehiculoService.findAll().subscribe({
    next: (vehiculos) => this.vehiculos.set(vehiculos),
    error: () => this.notificacionService.error('Error al cargar vehículos')
  });
}

// 🔹 Filtrado de pagos
get pagosFiltrados(): any[] {
  const filtro = this.filtroPago().toLowerCase();
  return this.pagos().filter(p =>
    p.numeroBoleta.toLowerCase().includes(filtro)
  );
}

// 🔹 Filtrado de vehículos
get vehiculosFiltrados(): Vehiculo[] {
  const filtro = this.filtroVehiculo().toLowerCase();
  return this.vehiculos().filter(v =>
    v.placa.toLowerCase().includes(filtro) ||
    v.marca.toLowerCase().includes(filtro)
  );
}


save(): void {
  if (this.form.invalid) {
    this.notificacionService.error('Por favor completa todos los campos requeridos.');
    return;
  }

  const reserva: ReservaRequest = {
    id: this.data ? this.data.id : 0, //
    pagoId: this.form.get('pagoId')?.value,
    vehiculoId: this.form.get('vehiculoId')?.value,
    fechaReserva: this.form.get('fechaReserva')?.value,
    minutosReservados: this.form.get('minutosReservados')?.value
  };

  const request$ = this.isEditing
    ? this.reservaService.update(this.data!.id!, reserva)
    : this.reservaService.create(reserva);

  request$.subscribe({
    next: (res) => {
      this.notificacionService.success(
        this.isEditing ? 'Reserva actualizada correctamente.' : 'Reserva creada correctamente.'
      );
      this.dialogRef.close(res);
    },
    error: (err) => {
      console.error('Error al guardar reserva:', err);
      this.notificacionService.error('Ocurrió un error al guardar la reserva. Intenta nuevamente.');
    }
  });
}

  close(): void {
    this.dialogRef.close();
  }


openCalendarDialog(): void {
  const vehiculoId = this.form.get('vehiculoId')?.value;

  if (!vehiculoId) {
    this.notificacionService.error('Por favor selecciona un vehículo primero.');
    return;
  }

  const dialogRef = this.dialog.open(CalendarSelectorDialog, {
    width: '900px',
    maxHeight: '90vh',
    disableClose: false,
    data: { vehiculoId } // Pasa el ID del vehículo
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.form.patchValue({
        fechaReserva: new Date(result.fechaReserva),
        minutosReservados: result.minutosReservados
      });

      this.notificacionService.success(
        `✅ Reserva seleccionada: ${result.minutosReservados} minutos`
      );
    }
  });

}

// Necesitas inyectar MatDialog si no lo tienes:
private readonly dialog = inject(MatDialog);
}