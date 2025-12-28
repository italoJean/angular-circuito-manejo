import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

import { Observable } from 'rxjs';
import { ReservaRequest } from '../model/reserva-request.model';
import { ReservaResponse } from '../model/reserva-response.model';
import { DetalleReservaResponse } from '../model/detalle-response.model';
import { PagoMinutosDTO } from '../model/event/pago-minutos.model';
import { ReprogramacionRequestDTO } from '../model/event/reprogramacion-request.model';
import { IncidenciaRequestDTO } from '../model/event/incidencia-request.model';
import { HorarioOcupadoDTO } from '../model/event/horario-ocupado.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly http=inject(HttpClient);
  private readonly baseUrl: string = `${environment.API_URL}/reservas`;
  
    create(reserva: ReservaRequest): Observable<ReservaResponse> {
      return this.http.post<ReservaResponse>(this.baseUrl, reserva);
    }

    findAll(): Observable<ReservaResponse[]> {
      return this.http.get<ReservaResponse[]>(this.baseUrl);
    }

    findByIdDetalle(id: number): Observable<DetalleReservaResponse> {
      return this.http.get<DetalleReservaResponse>(`${this.baseUrl}/${id}/detalle`);
    }

    findByIdMinutos(id: number): Observable<PagoMinutosDTO> {
      return this.http.get<PagoMinutosDTO>(`${this.baseUrl}/${id}/minutos`);
    }

    update(id: number, reserva: ReservaRequest): Observable<ReservaResponse> {
      return this.http.put<ReservaResponse>(`${this.baseUrl}/${id}`, reserva);
    }

    registrarIncidencia(id: number, incidencia: IncidenciaRequestDTO): Observable<ReservaResponse> {
      return this.http.post<ReservaResponse>(`${this.baseUrl}/${id}/incidencia`, incidencia);
    }

    reprogramar(id: number, dto: ReprogramacionRequestDTO): Observable<ReservaResponse> {
      return this.http.patch<ReservaResponse>(`${this.baseUrl}/${id}/reprogramar`, dto);
    }
  
    cancelar(id: number): Observable<void> {
      return this.http.patch<void>(`${this.baseUrl}/${id}/cancelar`,{});
    }

    delete(id: number): Observable<void> {
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

      findAllCalendario(): Observable<HorarioOcupadoDTO[]> {
      return this.http.get<HorarioOcupadoDTO[]>(`${this.baseUrl}/calendario`);
    }

    getHorariosOcupados(vehiculoId: number, pagoId: number): Observable<HorarioOcupadoDTO[]> {
  const params = new HttpParams()
    .set('vehiculoId', vehiculoId.toString())
    .set('pagoId', pagoId.toString());

  return this.http.get<HorarioOcupadoDTO[]>(`${this.baseUrl}/horarios`, { params });
}
  }
  