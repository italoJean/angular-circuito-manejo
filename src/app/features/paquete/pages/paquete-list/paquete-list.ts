import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Grid } from '../../../../shared/components/grid/grid';
import { Paquete } from '../../model/paquete.model';
import { PaqueteService } from '../../services/paquete.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { PaqueteForm } from '../paquete-form/paquete-form';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';

@Component({
  selector: 'app-paquete-list',
  imports: [Grid, MaterialModule],
  templateUrl: './paquete-list.html',
  styleUrl: './paquete-list.scss',
})
export class PaqueteList implements OnInit {
  private readonly _modalService = inject(ModalService);
  private readonly _paqueteService = inject(PaqueteService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _dialogService = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  // Guarda el estado de la lista de paquetes.
  data = signal<Paquete[]>([]);

  // Define las columnas que se mostrarán en la tabla (app-grid)
  displayedColumns: Array<string> = [
    'id',
    'nombre',
    'descripcion',
    'duracionMinutos',
    'precioTotal',
    'action',
  ];

  // Lista de columnas ordenables en la tabla (las que se pueden ordenar)
  sortables: Array<string> = [
    'id',
    'nombre',
    'duracionMinutos',
    'precioTotal',
  ] as const;

  readonly columnLabels = signal<Record<string, string>>({
    id: 'ID',
    nombre: 'Nombre',
    descripcion: 'Descripción',
    duracionMinutos: 'Duración',
    precioTotal: 'Precio',
    action: 'Acción',
  });

  ngOnInit(): void {
    this.loadPaquetes();
  }

  loadPaquetes() {
    this._paqueteService.findAll().subscribe({
      //se suscribe a la respuesta (Observable)
      next: (paquetes) => {
        // Actualiza el signal data con this.data.set(paquetes)
        this.data.set(paquetes);
        // console.log('Paquetes cargados:', paquetes);
      },
      error: (error) => {
        console.error('Error al cargar paquetes:', error);
        this._notificacionService.error('Error al cargar paquetes');
      },
    });
  }

  openCreateModal(): void {
    this._modalService.openModal(PaqueteForm)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((nuevo) => {
      if (nuevo) {
        this._notificacionService.success('Paquete creado correctamente');
        this.loadPaquetes();
      }
    });
  }

  openEditModal(paquete: Paquete): void {
    this._modalService.openModal(PaqueteForm, paquete)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((editado) => {
      if (editado) {
        this._notificacionService.success('Paquete actualizado correctamente');
        this.loadPaquetes();
      }
    });
  }

deletePaquete(paquete: Paquete): void {
        const paqueteId = paquete.id!; // Asumimos que el ID está presente para la eliminación

        this._dialogService
            .confirm('Eliminar Paquete', `¿Seguro que deseas eliminar "${paquete.nombre}"?`)
            .pipe(
                // Asegura que el observable se complete si el componente muere.
                takeUntilDestroyed(this.destroyRef), 

                // ENCADENAMIENTO: Espera el resultado del diálogo (true/undefined).
                //    Si 'confirmed' es true, switchMap cambia al Observable de la llamada DELETE.
                //    Si es false/undefined (cancelar), switchMap devuelve EMPTY para detener el flujo.
                switchMap((confirmed) => {
                    if (confirmed) {
                        return this._paqueteService.delete(paqueteId);
                    }
                    // Retornar EMPTY detiene la ejecución del subscribe(next).
                    return EMPTY;
                })
            )
            .subscribe({
                //  RESULTADO: Este 'next' solo se ejecuta si la API DELETE es exitosa.
                next: () => {
                    this._notificacionService.success('Paquete eliminado correctamente');
                    this.loadPaquetes();
                },
                //  ERROR: Captura cualquier error de la llamada DELETE.
                error: () => this._notificacionService.error('Error al eliminar paquete'),
            });
    }
  }
