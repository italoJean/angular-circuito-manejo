import { Component, inject, Inject, OnInit } from '@angular/core';
import { MaterialModule } from "../../../../shared/ui/material-module";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificacionService } from '../../../../shared/services/notificacion.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


interface IncidenciaData {
    reservaId: number;
}

@Component({
  selector: 'app-reserva-incidencia-modal',
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './reserva-incidencia-modal.html',
  styleUrl: './reserva-incidencia-modal.scss',
})
export class ReservaIncidenciaModal implements OnInit {
  
    private readonly fb = inject(FormBuilder);
    private readonly dialogRef = inject(MatDialogRef<ReservaIncidenciaModal>);
    private readonly notificacionService = inject(NotificacionService);

    form!: FormGroup;

    constructor(@Inject(MAT_DIALOG_DATA) public data: IncidenciaData) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            detalle: ['', [
                Validators.required, 
                Validators.minLength(10),
                Validators.maxLength(250) // Limita el tamaño del texto
            ]], 
        });
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.notificacionService.error('Por favor, completa el detalle (mínimo 10 caracteres).');
            return;
        }

        // Extraemos el valor de forma segura
         const payload = this.form.getRawValue();
        
        
        // Esto regresa al .subscribe() de ReservaList
        this.dialogRef.close(payload); 
    }

    close(): void {
        this.dialogRef.close(null); 
    }
}
