import { Component, inject, OnInit, signal } from '@angular/core';
import { Grid } from "../../../../shared/components/grid/grid";
import {  Paquete } from '../../model/paquete.model';
import { PaqueteService } from '../../services/paquete.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { DialogService } from '../../../../shared/services/dialog.service';
import { ModalService } from '../../../../shared/services/modal.service';
import { PaqueteForm } from '../paquete-form/paquete-form';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { A11yModule } from "@angular/cdk/a11y";

@Component({
  selector: 'app-paquete-list',
  imports: [Grid, MaterialModule, A11yModule],
  templateUrl: './paquete-list.html',
  styleUrl: './paquete-list.scss',
})
export class PaqueteList implements OnInit{

  private readonly _modalService=inject(ModalService);
  private readonly _paqueteService=inject(PaqueteService);
  private readonly _notificacionService=inject(NotificacionService);
  private readonly _dialogService=inject(DialogService);

  // Guarda el estado de la lista de paquetes.
  data = signal<Paquete[]>([]);

  // Define las columnas que se mostrarán en la tabla (app-grid)
  // keyof Paquete asegura que solo se puedan usar nombres válidos de propiedades del modelo Paquete
  displayedColumns: Array<keyof Paquete | 'action'> = ['id', 'nombre', 'descripcion', 'duracionMinutos', 'precioTotal', 'action'];
  // Lista de columnas ordenables en la tabla (las que se pueden ordenar)
  // as const las hace inmutables (readonly)
  sortables: Array<keyof Paquete> = ['id', 'nombre', 'descripcion', 'duracionMinutos', 'precioTotal'] as const;

 readonly columnLabels = signal<Record<string, string>>({
  id: 'ID',
  nombre: 'Nombre',
  descripcion: 'Descripción',
  duracionMinutos: 'Duración (minutos)',
  precioTotal: 'Precio Total',
  action: 'Acción'
});


  ngOnInit(): void {
    this.loadPaquetes();
  }

  loadPaquetes() {
    this._paqueteService.findAll().subscribe({  //se suscribe a la respuesta (Observable)
      next: (paquetes) => {
        // Actualiza el signal data con this.data.set(paquetes)
        this.data.set(paquetes);
        console.log('Paquetes cargados:', paquetes);
      },
      error: (error) => {
        console.error('Error al cargar paquetes:', error);
        this._notificacionService.error('Error al cargar paquetes');
      }
    });
  }
  
  openCreateModal(): void {
    this._modalService.openModal(PaqueteForm).subscribe((nuevo) => {
      if (nuevo) { 
        this._notificacionService.success('Paquete creado correctamente');
        this.loadPaquetes();
        }
    });
  }

  openEditModal(paquete: Paquete): void {
    this._modalService.openModal(PaqueteForm, paquete).subscribe((editado) => {
      if (editado)  {
        this._notificacionService.success('Paquete actualizado correctamente');
        this.loadPaquetes();
      }
    });
  }

  deletePaquete(paquete: Paquete): void {
    this._dialogService
      .confirm('Eliminar Paquete', `¿Seguro que deseas eliminar "${paquete.nombre}"?`)
      .subscribe((confirmed) => {
        if (confirmed) {
          this._paqueteService.delete(paquete.id!).subscribe({
            next: () => {
              this._notificacionService.success('Paquete eliminado correctamente');
              this.loadPaquetes();
            },
            error: () => this._notificacionService.error('Error al eliminar paquete'),
          });
        }
      });
  }
}