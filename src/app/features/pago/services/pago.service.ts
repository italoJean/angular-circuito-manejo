import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { PagoContadoRequestDTO } from '../model/pago-contado.request.model';
import { PagoCuotasRequestDTO } from '../model/pago-cuotas.request.model';
import { PagoListadoResponseDTO } from '../model/pago-listado.response.model';
import { PagoDetalleResponseDTO } from '../model/pago-detalle.response.model';
import { MetodoPagoEnum } from '../enum/metodo-pago.enum';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = `${environment.API_URL}/pagos`;

  createCuotas(pago: PagoCuotasRequestDTO): Observable<PagoListadoResponseDTO> {
    return this.http.post<PagoListadoResponseDTO>(`${this.baseUrl}/cuotas`, pago);
  }

  createContado(pago: PagoContadoRequestDTO): Observable<PagoListadoResponseDTO> {
    return this.http.post<PagoListadoResponseDTO>(`${this.baseUrl}/contado`, pago);
  }

  findAll(): Observable<PagoListadoResponseDTO[]> {
    return this.http.get<PagoListadoResponseDTO[]>(this.baseUrl);
  }

  findByDetalleId(id: number): Observable<PagoDetalleResponseDTO> {
    return this.http.get<PagoDetalleResponseDTO>(`${this.baseUrl}/detalle/${id}`);
  }

  suspenderPago(id: number): Observable<any> {
    return this.http.patch<void>(`${this.baseUrl}/suspender/${id}`, {});
  }

  pagarCuota(pagoId: number, cuotaId: number, metodoPago: MetodoPagoEnum): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${pagoId}/cuotas/${cuotaId}/pagar`, { metodoPago });
  }
}
