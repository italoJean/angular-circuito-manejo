import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Vehiculo } from '../model/vehiculo.model';
import { Observable } from 'rxjs';

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

  update(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.baseUrl}/${id}`, vehiculo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getVehiculoById(id: number): Observable<Vehiculo>{
    return this.http.get<Vehiculo>(`${this.baseUrl}/${id}`);
  }
}