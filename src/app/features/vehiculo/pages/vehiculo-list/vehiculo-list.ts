import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { VehiculoForm } from '../vehiculo-form/vehiculo-form';
import { Grid } from '../../../../shared/components/grid/grid';
import { Vehiculo } from '../../model/vehiculo.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-vehiculo-list',
  imports: [Grid, MaterialModule],
  templateUrl: './vehiculo-list.html',
  styleUrl: './vehiculo-list.scss',
})
export class VehiculoList implements OnInit {
  // INYECCIÓN DE DEPENDENCIAS
  private readonly _modalService = inject(ModalService);
  private readonly _vehiculoService = inject(VehiculoService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef); // Reemplaza el antiguo ngOnDestroy

  // REACTIVIDAD CON SIGNALS
  // Usar signals permite que Angular detecte cambios de forma ultra-eficiente
  data = signal<Vehiculo[]>([]);

  // Configuración de columnas para el componente reutilizable <app-grid>
  displayedColumns: Array<keyof Vehiculo | 'action'> = [
    'id',
    'placa',
    'marca',
    'modelo',
    'tipoTransmision',
    'estado',
    'action',
  ];

  sortables: Array<keyof Vehiculo> = [
    'id',
    'placa',
    'marca',
    'modelo',
    'tipoTransmision',
    'estado',
  ];

  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    placa: 'Placa',
    marca: 'Marca',
    modelo: 'Modelo',
    tipoTransmision: 'Tipo de Transmisión',
    estado: 'Estado',
    action: 'Acciones',
  });

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos() {
    // vinculamos la suscripción al ciclo de vida del componente
    this._vehiculoService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (vehiculos) => this.data.set(vehiculos),
        error: () => this._notificacionService.error('Error al conectar con el servidor'),
      });
  }

  openCreateModal(): void {
    this._modalService
      .openModal(VehiculoForm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nuevo) => {
        // Solo recargamos si el modal devolvió un objeto (confirmación de guardado)
        if (nuevo) {
          this._notificacionService.success('Vehiculo creado correctamente');
          this.loadVehiculos();
        }
      });
  }

  openEditModal(vehiculo: Vehiculo): void {
    this._modalService
      .openModal(VehiculoForm, vehiculo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((editado) => {
        if (editado) {
          this._notificacionService.success('Vehiculo actualizado correctamente');
          this.loadVehiculos();
        }
      });
  }

  /*
   * PATRÓN DECLARATIVO (switchMap):
   * Evita "Callback Hell". Primero confirma, y si el resultado es true,
   * "cambia" el flujo hacia la petición de eliminación.
  */
  deleteVehiculo(vehiculo: Vehiculo): void {
    if (!vehiculo.id) return;

    this._dialogService
      .confirm(
        'Eliminar Vehículo',
        `¿Está seguro de eliminar el vehículo con placa: ${vehiculo.modelo}?`
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) => {
          // Si el usuario cancela, devolvemos un observable vacío que detiene el flujo
          if (!confirmed) return EMPTY;
          return this._vehiculoService.delete(vehiculo.id!);
        })
      )
      .subscribe({
        next: () => {
          this._notificacionService.success('Eliminado correctamente');
          this.loadVehiculos();
        },
        error: (err) => {
          // El error suele venir del backend (ej: Vehículo con reserva activa no se puede borrar)
          const msg = err.error?.mensaje || 'No se pudo eliminar el vehículo';
          this._notificacionService.error(msg);
        },
      });
  }
}
