import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
loginConGoogle() {
  // Redirigimos al endpoint de Spring Boot que inicia el flujo de OAuth2
  // window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  window.location.href = 'https://spring-boot-rest-circuito-manejo-production.up.railway.app/oauth2/authorization/google';
}
}
