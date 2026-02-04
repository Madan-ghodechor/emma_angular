import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./footer/footer";
import { Header } from "./header/header";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Footer, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('emmaApp');
}
