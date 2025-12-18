import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Vehiculo } from '../model/vehiculo.model';
import { Observable } from 'rxjs';
import { HorarioOcupadoDTO } from '../../reserva/model/event/horario-ocupado.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = `${environment.API_URL}/vehiculos`;

  create(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.baseUrl, vehiculo);
  }

  findAll(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.baseUrl);
  }

  findAllDisponible(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.baseUrl}/disponibles`);
  }

  
  findAllOperativos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.baseUrl}/operativos`);
  }

  update(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.baseUrl}/${id}`, vehiculo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getVehiculoById(id: number): Observable<Vehiculo>{
    return this.http.get<Vehiculo>(`${this.baseUrl}/${id}`);
  }

  
  getHorarioOcupado(vehiculoId: number): Observable<HorarioOcupadoDTO[]>{
    return this.http.get<HorarioOcupadoDTO[]>(`${this.baseUrl}/${vehiculoId}/horarios-ocupados`);
  }

   getHorarioClientePago(pagoId: number): Observable<HorarioOcupadoDTO[]>{
    return this.http.get<HorarioOcupadoDTO[]>(`${this.baseUrl}/${pagoId}/horarios-ocupados-cliente`);
  }
}