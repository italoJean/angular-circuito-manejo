import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Usuario } from '../model/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = `${environment.API_URL}/usuarios`;

  create(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario);
  }

  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  update(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getUsuarioById(id: number): Observable<Usuario>{
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }
}