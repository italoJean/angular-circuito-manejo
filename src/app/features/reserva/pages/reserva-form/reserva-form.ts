import { Component, computed, Inject, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { ReservaService } from '../../services/reserva.service';
import { EstadoReservaEnum } from '../../enum/estado-reserva.enum';
import { ReservaRequest } from '../../model/reserva-request.model';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../usuario/services/usuario.service';
import { PaqueteService } from '../../../paquete/services/paquete.service';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { PagoService } from '../../../pago/services/pago.service';
import { VehiculoService } from '../../../vehiculo/services/vehiculo.service';
import { Vehiculo } from '../../../vehiculo/model/vehiculo.model';
import { CalendarSelectorDialog } from '../../components/calendar-selector-dialog/calendar-selector-dialog';

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
    MaterialModule,
  ],
  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.scss',
})
export class ReservaForm implements OnInit {

  
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReservaForm>);
  private readonly pagoService = inject(PagoService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly reservaService = inject(ReservaService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly dialog = inject(MatDialog);

  public readonly tipoDocumentos = Object.values(EstadoReservaEnum);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: ReservaRequest) {}

  form!: FormGroup;
  isEditing = false;

  pagos = signal<any[]>([]);
  vehiculos = signal<Vehiculo[]>([]);

  // Filtros dinámicos (signals)
  filtroPago = signal('');
  filtroVehiculo = signal('');

  ngOnInit(): void {
    this.form = this.fb.group({
      pagoId: [this.data?.pagoId || '', Validators.required],
      vehiculoId: [this.data?.vehiculoId || '', Validators.required],
      fechaReserva: [this.data?.fechaReserva || '', Validators.required],
      minutosReservados: [
        this.data?.minutosReservados || '',
        [Validators.required, Validators.min(1)],
      ],
    });

    this.isEditing = !!this.data;

    this.loadPagos();
    this.loadVehiculos();
  }

  // Cargar pagos 
  loadPagos() {
    this.pagoService.findAll()
    .subscribe({
      next: (pagos) => this.pagos.set(pagos),
      error: () => this.notificacionService.error('Error al cargar pagos'),
    });
  }
  
  // Filtrado de pagos
  get pagosFiltrados(): any[] {
    const filtro = this.filtroPago().toLowerCase();
    return this.pagos().filter((p) =>p.numeroBoleta.toLowerCase().includes(filtro) || 
        p.nombreUsuario.toLowerCase().includes(filtro) ||
        p.apellidoUsuario.toLowerCase().includes(filtro));
  }

  // Cargar vehículos 
  loadVehiculos() {
    this.vehiculoService.findAllOperativos().subscribe({
      next: (vehiculos) => this.vehiculos.set(vehiculos),
      error: () => this.notificacionService.error('Error al cargar vehículos'),
    });
  }

  // Filtrado de vehículos
  get vehiculosFiltrados(): Vehiculo[] {
    const filtro = this.filtroVehiculo().toLowerCase();
    return this.vehiculos().filter(
      (v) => v.placa.toLowerCase().includes(filtro) || v.marca.toLowerCase().includes(filtro)
    );
  }


  save(): void {
    if (this.form.invalid) {
      this.notificacionService.error('Por favor completa todos los campos requeridos.');
      return;
    }

    const reserva: ReservaRequest = {
      id: this.data ? this.data.id : 0, 
      pagoId: this.form.get('pagoId')?.value,
      vehiculoId: this.form.get('vehiculoId')?.value,
      fechaReserva: this.form.get('fechaReserva')?.value,
      minutosReservados: this.form.get('minutosReservados')?.value,
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
        this.notificacionService.error(
          'Ocurrió un error al guardar la reserva. Intenta nuevamente.'
        );
      },
    });
  }

openCalendarDialog(): void {
    const vehiculoId = this.form.get('vehiculoId')?.value;
    const pagoId = this.form.get('pagoId')?.value; // Este ID se refiere al pago, que asocia al cliente

    if (!vehiculoId || !pagoId) {
        this.notificacionService.error('Por favor selecciona un vehículo y un pago primero.');
        return;
    }

    const dialogRef = this.dialog.open(CalendarSelectorDialog, {
        data: {
            vehiculoId: vehiculoId, 
            pagoId: pagoId, // ⬅️ ¡Pasar el ID del cliente es crucial!
        }, 
        // ... (resto de las opciones del diálogo)
    });
    dialogRef.afterClosed().subscribe((result: { fechaReserva: string, minutosReservados: number } | undefined) => {
        if (result) {
            // 🚨 ¡Aquí está la clave! PatchValue con los datos devueltos por el diálogo
            this.form.patchValue({
                fechaReserva: result.fechaReserva, // Fecha y hora seleccionadas (start)
                minutosReservados: result.minutosReservados, // Duración calculada
            });

            this.notificacionService.success(
                `✅ Reserva seleccionada: ${result.minutosReservados} minutos, Fecha: ${new Date(result.fechaReserva).toLocaleString()}`
            );
        }
    });
}

  close(): void {
    this.dialogRef.close();
  }

}

  