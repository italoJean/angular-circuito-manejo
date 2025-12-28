import { Component, effect, EventEmitter, input, OnInit, Output, signal, viewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Filter } from './filter/filter';
import { MatIcon } from '@angular/material/icon';
import { MinutosHorasPipe } from '../../pipes/minutos-horas-pipe';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

const MATERIAL_MODULES = [MatTableModule, MatSortModule, MatPaginatorModule, MatIcon,MatTooltip];
@Component({
  selector: 'app-grid',
  imports: [MATERIAL_MODULES, Filter, MinutosHorasPipe, CurrencyPipe, DatePipe],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid<T> implements OnInit {
  // INPUTS (Signals)
  displayedColumns = input.required<string[]>();
  data = input.required<T[]>();
  sortableColumns = input<string[]>([]);
  columnLabels = input<Record<string, string>>({});
  pipesMap = input<Record<string, 'minutosHoras' | 'currency' | 'date' | string>>({});

  // REFERENCIAS A ELEMENTOS (Signals)
  // viewChild como signal es preferible a @ViewChild tradicional.
  private readonly _sort = viewChild.required<MatSort>(MatSort);
  private readonly _paginator = viewChild.required<MatPaginator>(MatPaginator);

  // ESTADO INTERNO
  dataSource = new MatTableDataSource<T>();
  valueToFilter = signal('');

  // OUTPUTS (Eventos)
  @Output() details = new EventEmitter<T>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() refresh = new EventEmitter<void>();
  // Eventos específicos de reservas/incidencias
  @Output() reservas = new EventEmitter<T>();
  @Output() reprogramar = new EventEmitter<T>();
  @Output() incidencia = new EventEmitter<T>();
  @Output() cancelar = new EventEmitter<T>();

  constructor() {
    /**
     * EFECTO DE SINCRONIZACIÓN
     * Este efecto reacciona automáticamente cuando los datos de entrada cambian
     * o cuando el usuario escribe en el filtro.
     */
    effect(
      () => {
        // 1. Sincronizar datos
        this.dataSource.data = this.data();

        // 2. Aplicar filtro reactivamente
        this.dataSource.filter = this.valueToFilter().trim().toLowerCase();

        // 3. Vincular Sort y Paginator cuando estén disponibles en el DOM
        // Tip: viewChild() devuelve la referencia una vez que la vista se renderiza.
        if (this._sort()) this.dataSource.sort = this._sort()!;
        if (this._paginator()) this.dataSource.paginator = this._paginator()!;

        // Resetear paginación al filtrar
        if (this.dataSource.paginator && this.valueToFilter()) {
          this.dataSource.paginator.firstPage();
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.dataSource.data = this.data();
    this.dataSource.sort = this._sort();
    this.dataSource.paginator = this._paginator();
  }

  /**
   * Captura el evento del input de búsqueda y actualiza el signal.
   * Al actualizar el signal, el effect se dispara automáticamente.
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.valueToFilter.set(filterValue);
  }

  handleRefresh(): void {
    // Limpiamos el filtro si lo deseas al refrescar
    this.valueToFilter.set('');

    // Emitimos al padre para que vuelva a llamar al servicio
    this.refresh.emit();
  }
}
