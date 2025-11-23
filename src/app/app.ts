import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FullCalendar } from "./shared/components/full-calendar/full-calendar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FullCalendar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('circuito-manejo-angular');
}
