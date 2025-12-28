import { Component, computed, DestroyRef, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PagoService } from '../../services/pago.service';
import { PaqueteService } from '../../../paquete/services/paquete.service';
import { UsuarioService } from '../../../usuario/services/usuario.service';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { Usuario } from '../../../usuario/model/usuario.model';
import { Paquete } from '../../../paquete/model/paquete.model';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { CommonModule } from '@angular/common';
import { MetodoPagoEnum } from '../../enum/metodo-pago.enum';
import { PagoCuotasRequestDTO } from '../../model/pago-cuotas.request.model';
import { PagoContadoRequestDTO } from '../../model/pago-contado.request.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pago-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MaterialModule
],
  templateUrl: './pago-form.html',
  styleUrl: './pago-form.scss',
})
export class PagoForm implements OnInit {
// INYECCIONES
  private readonly _fb = inject(FormBuilder);
  private readonly _dialogRef = inject(MatDialogRef<PagoForm>);
  private readonly _pagoService = inject(PagoService);
  private readonly _paqueteService = inject(PaqueteService);
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _notificacionService = inject(NotificacionService);
  private readonly _destroyRef = inject(DestroyRef);

  // ESTADO
  form!: FormGroup;
  isEditing = false;
  loading = false;
  
  // Catálogos
  usuarios = signal<Usuario[]>([]);
  paquetes = signal<Paquete[]>([]);
  
  // FILTROS CON SIGNALS
  filtroUsuario = signal('');
  filtroPaquete = signal('');

  // COMPUTED SIGNALS: Se recalculan automáticamente cuando los datos o el filtro cambian
  usuariosFiltrados = computed(() => {
    const filter = this.filtroUsuario().toLowerCase();
    return this.usuarios().filter(u => 
      u.nombre.toLowerCase().includes(filter) || u.numeroDocumento.includes(filter)
    );
  });

  paquetesFiltrados = computed(() => {
    const filter = this.filtroPaquete().toLowerCase();
    return this.paquetes().filter(p => p.nombre.toLowerCase().includes(filter));
  });

  public readonly metodoPagos = Object.values(MetodoPagoEnum);

  constructor(@Inject(MAT_DIALOG_DATA) public data?: any) {}

  ngOnInit(): void {
    this.isEditing = !!this.data;
    this.initForm();
    this.loadInitialData();
    this.setupConditionalValidation();
  }

  private initForm(): void {
    this.form = this._fb.group({
      usuarioId: [this.data?.usuarioId || '', Validators.required],
      paqueteId: [this.data?.paqueteId || '', Validators.required],
      metodoPago: [this.data?.metodoPago || '', Validators.required],
      pagarEnCuotas: [false],
      cuotas: [null, [Validators.min(2), Validators.max(12)]],
      montoPrimerPago: [null, [Validators.min(2)]]
    });
  }

  /**
   * VALIDACIÓN CONDICIONAL: 
   * Si 'pagarEnCuotas' es true, activamos validadores para cuotas y monto.
   */
  private setupConditionalValidation(): void {
    this.form.get('pagarEnCuotas')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(isCuotas => {
        const cuotasCtrl = this.form.get('cuotas');
        const montoCtrl = this.form.get('montoPrimerPago');

        if (isCuotas) {
          cuotasCtrl?.setValidators([Validators.required, Validators.min(2)]);
          montoCtrl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          cuotasCtrl?.clearValidators();
          montoCtrl?.clearValidators();
          cuotasCtrl?.reset();
          montoCtrl?.reset();
        }
        cuotasCtrl?.updateValueAndValidity();
        montoCtrl?.updateValueAndValidity();
      });
  }

  private loadInitialData(): void {
    this._usuarioService.findAll().subscribe(data => this.usuarios.set(data));
    this._paqueteService.findAll().subscribe(data => this.paquetes.set(data));
  }

  // ACTUALIZADORES DE FILTRO (Llamados desde el HTML)
  onFilterUsuario(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filtroUsuario.set(value);
  }

  onFilterPaquete(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filtroPaquete.set(value);
  }

  /**
   * ESTRATEGIA DE GUARDADO:
   * Dependiendo del toggle, enviamos a un endpoint u otro del PagoService.
   */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formVal = this.form.value;

    const request$ = formVal.pagarEnCuotas 
      ? this._pagoService.createCuotas(this.mapToCuotasDTO(formVal))
      : this._pagoService.createContado(this.mapToContadoDTO(formVal));

    request$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: (res) => {
        this._dialogRef.close(res);
      },
      error: (err) => {
        this.loading = false;
        this._notificacionService.error(err.error?.mensaje || 'Error al procesar el pago');
      }
    });
  }

  private mapToCuotasDTO(val: any): PagoCuotasRequestDTO {
    return {
      usuarioId: val.usuarioId,
      paqueteId: val.paqueteId,
      metodoPago: val.metodoPago,
      cuotas: val.cuotas,
      montoPrimerPago: val.montoPrimerPago
    };
  }

  private mapToContadoDTO(val: any): PagoContadoRequestDTO {
    return {
      usuarioId: val.usuarioId,
      paqueteId: val.paqueteId,
      metodoPago: val.metodoPago
    };
  }

  close(): void { this._dialogRef.close(); }
}