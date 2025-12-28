import { Component, computed, inject, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { ReservaService } from '../../services/reserva.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { ReprogramacionRequestDTO } from '../../model/event/reprogramacion-request.model';
import { CommonModule, DatePipe } from '@angular/common';
import { DetalleReservaResponse } from '../../model/detalle-response.model';
import { VehiculoService } from '../../../vehiculo/services/vehiculo.service';
import { HorarioOcupadoDTO } from '../../model/event/horario-ocupado.model';
import { Vehiculo } from '../../../vehiculo/model/vehiculo.model';
import { CalendarSelectorDialog } from '../calendar-selector-dialog/calendar-selector-dialog';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-reserva-reprogramar-modal',
  imports: [MaterialModule, CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './reserva-reprogramar-modal.html',
  styleUrl: './reserva-reprogramar-modal.scss',
})
export class ReservaReprogramarModal {

  // Inyección de dependencias moderna
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReservaReprogramarModal>);
  private readonly reservaService = inject(ReservaService);
  private readonly vehiculoService = inject(VehiculoService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly dialog = inject(MatDialog);

  // Datos de la reserva
  public readonly reservaId: number;
  public reservaOriginal: DetalleReservaResponse | null = null;

  public todasReservas: HorarioOcupadoDTO[] = []; // Reservas del vehículo (para validación)

  // Estado de la interfaz
  public isLoading:boolean=true; 

  // Gestión de Vehículos con Signals
  private vehiculos = signal<Vehiculo[]>([]);
  public filtroVehiculo = signal('');

  constructor(@Inject(MAT_DIALOG_DATA) public data: ReprogramacionRequestDTO) {
    this.reservaId = data.id;
  }

  form!: FormGroup;
  ngOnInit(): void {
    this.initForm(); // Inicializa la estructura del formulario
    this.loadVehiculos(); // Carga la lista de vehículos
    this.loadDetalleReserva(); // Carga los datos de la reserva original
  }

  initForm(): void {
    this.form = this.fb.group({
      // El pagoId es necesario para el DTO, pero lo obtendremos de reservaOriginal

      // Campos que el usuario puede cambiar o que el calendario actualiza
      vehiculoId: [this.data?.vehiculoId || '', Validators.required],
      fechaReserva: [this.data?.nuevaFecha || '', Validators.required],
      minutosReservados: [
        this.data?.minutosReservados || '',
        [Validators.required, Validators.min(1)],
      ],
    });
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

  loadDetalleReserva(): void {
    this.reservaService.findByIdDetalle(this.reservaId).subscribe({
      next: (original) => {
        this.reservaOriginal = original;
      },
      error: () => {
        this.notificacionService.error('Error cargando horarios del vehículo inicial.');
        this.isLoading = false;
      },
    });
  }

  openCalendarDialog(): void {
    const vehiculoId = this.form.get('vehiculoId')?.value;
    const pagoId = this.data.id; // Obtenemos el pagoId de la reserva original
    console.log('Abriendo CalendarSelectorDialog con vehiculoId:', vehiculoId, 'y pagoId:', pagoId);
    // 1. Validar IDs
    if (!vehiculoId || !pagoId) {
      this.notificacionService.error(
        'Por favor, seleccione un vehículo y asegúrese de que la reserva original haya cargado.'
      );
      return;
    }

    const dialogRef = this.dialog.open(CalendarSelectorDialog, {
      data: {
        vehiculoId: vehiculoId,
        pagoId: pagoId, // ⬅️ ¡Pasar el ID del cliente es crucial!
      },
      // ... (resto de las opciones del diálogo)
    });
    dialogRef
      .afterClosed()
      .subscribe((result: { fechaReserva: string; minutosReservados: number } | undefined) => {
        if (result) {
          // 🚨 ¡Aquí está la clave! PatchValue con los datos devueltos por el diálogo
          this.form.patchValue({
            fechaReserva: result.fechaReserva, // Fecha y hora seleccionadas (start)
            minutosReservados: result.minutosReservados, // Duración calculada
          });

          this.notificacionService.success(
            `✅ Reserva seleccionada: ${result.minutosReservados} minutos, Fecha: ${new Date(
              result.fechaReserva
            ).toLocaleString()}`
          );
        }
      });
  }
  // --- ACCIONES DEL MODAL ---

  save(): void {
    // Asegurarse de que no estamos cargando y que el formulario es válido
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('Formulario inválido:', this.form.value);
      this.notificacionService.error('Por favor completa todos los campos requeridos.');
      return;
    }

    ///////por aqui del doble
    // 2. Extraer los datos necesarios del formulario
    const { vehiculoId, fechaReserva, minutosReservados } = this.form.value;

    // 3. Construir el DTO (Data Transfer Object) para el backend
    const reprogramacionDTO: ReprogramacionRequestDTO = {
      // Asegúrate de que los nombres de las propiedades coincidan con el DTO esperado por tu servicio.
      id: 0, //no pasa igual
      vehiculoId: vehiculoId,
      nuevaFecha: fechaReserva, // Asumimos que 'nuevaFecha' es el campo esperado por el backend
      minutosReservados: minutosReservados,
    };
    this.reservaService.reprogramar(this.reservaId, reprogramacionDTO).subscribe({
      next: (res) => {
        // this.isLoading = false;
        this.notificacionService.success('✅ Reserva reprogramada exitosamente!');
        // Cerrar el modal y devolver la reserva actualizada (si el backend la devuelve)
        this.dialogRef.close(res);
      },
      error: (err) => {
        // this.isLoading = false;
        console.error('Error al reprogramar reserva:', err);
        // Si el error contiene un mensaje específico (ej: cruce de horario), úsalo
        const mensajeError =
          err.error?.message || 'Ocurrió un error al reprogramar. Verifica los horarios.';
        this.notificacionService.error(mensajeError);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

