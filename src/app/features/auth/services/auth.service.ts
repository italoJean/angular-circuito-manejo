import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http=inject (HttpClient);
  private router = inject(Router);

  // Signal privado para manejar el estado del usuario
  private _currentUser = signal<any>(null);

  // Exponemos el usuario como un signal de solo lectura para los componentes
  public currentUser = computed(() => this._currentUser());

  /**
   * Verifica el estado de la sesión contra el Backend.
   * Se usa en los Guards para permitir o denegar acceso.
   */
  checkStatus(): Observable<boolean> {
    return this.http.get<any>(`${environment.API_URL}/user-info`, { withCredentials: true })
      .pipe(
        tap(user => this._currentUser.set(user)), // Si hay éxito, guardamos el usuario
        map(() => true),                          // Retornamos true para el Guard
        catchError(() => {
          this._currentUser.set(null);            // Si hay error (401), limpiamos
          return of(false);                       // Retornamos false para el Guard
        })
      );
    }

  /**
   * Cierra la sesión tanto en Spring como en Angular
   */
  logout() {
    this.http.post(`${environment.API_URL}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this._currentUser.set(null); // Limpiamos el signal
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.error('Error al cerrar sesión', err);
          // Incluso si falla el servidor, forzamos la salida en el front
          this._currentUser.set(null);
          this.router.navigate(['/auth/login']);
        }
      });
  }
}