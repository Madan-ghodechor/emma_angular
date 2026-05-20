import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-content',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {

}
