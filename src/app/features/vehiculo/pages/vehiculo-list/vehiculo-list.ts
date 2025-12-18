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
  private readonly _modalService = inject(ModalService);
  private readonly _vehiculoService = inject(VehiculoService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  // Usar signals para los datos
  data = signal<Vehiculo[]>([]);

  displayedColumns: Array<keyof Vehiculo | 'action'> = [
    'id',
    'placa',
    'marca',
    'modelo',
    'tipoTransmision',
    'estado',
    'action',
  ];
  sortables: Array<keyof Vehiculo> = ['id', 'placa', 'marca', 'modelo'] as const;

  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    placa: 'Placa',
    marca: 'Marca',
    modelo: 'Modelo',
    tipoTransmision: 'Tipo de Transmisión',
    estado: 'Estado',
    action: 'Acción',
  });

  ngOnInit(): void {
    this.loadVehiculos();
  }

  loadVehiculos() {
    this._vehiculoService.findAll().subscribe({
      next: (vehiculos) => {
        // Actualizar el signal con los nuevos datos
        this.data.set(vehiculos);
        // console.log('Vehiculos cargados:', vehiculos);
      },
      error: (error) => {
        console.error('Error al cargar vehiculos:', error);
        this._notificacionService.error('Error al cargar vehiculos');
      },
    });
  }

  openCreateModal(): void {
    this._modalService
      .openModal(VehiculoForm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nuevo) => {
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

  deleteVehiculo(vehiculo: Vehiculo): void {
    // 🚨 #ROBUSTNESS: Validación explícita en lugar de '!'
    if (!vehiculo.id) {
      this._notificacionService.error('ID de vehículo requerido para eliminar.');
      return;
    }
    const vehiculoId = vehiculo.id;

    // 🚨 #RXJS_DECLARATIVE: Usar switchMap para encadenar los observables
    this._dialogService
      .confirm('Eliminar Vehiculo', `¿Seguro que deseas eliminar "${vehiculo.modelo}"?`)
      .pipe(
        // También se limpia esta suscripción
        takeUntilDestroyed(this.destroyRef),
        // Encadena la confirmación con la llamada DELETE
        switchMap((confirmed) => {
          if (confirmed) {
            return this._vehiculoService.delete(vehiculoId);
          }
          // Detiene el flujo si el usuario cancela
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this._notificacionService.success('Vehiculo eliminado correctamente');
          this.loadVehiculos();
        },
        error: () => this._notificacionService.error('Error al eliminar vehiculo'),
      });
  }
}
