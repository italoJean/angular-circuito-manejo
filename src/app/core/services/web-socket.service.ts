import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs'; 
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  private stompClient!: Client;
  private notificaciones$ = new BehaviorSubject<any>(null);

  constructor(private zone: NgZone) {}

  conectar(usuarioId: number) {

    this.stompClient = new Client({
      webSocketFactory: () =>
        new SockJS('http://localhost:8080/ws'),

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = () => {
      console.log('✅ Conectado a WebSocket');

      this.stompClient.subscribe(
        `/user/${usuarioId}/queue/notificaciones`,
        (message: IMessage) => {
          this.zone.run(() => {
            this.notificaciones$.next(JSON.parse(message.body));
          });
        }
      );
    };

    this.stompClient.activate();
  }

  getNotificaciones() {
    return this.notificaciones$.asObservable();
  }

  desconectar() {
    this.stompClient?.deactivate();
  }
}