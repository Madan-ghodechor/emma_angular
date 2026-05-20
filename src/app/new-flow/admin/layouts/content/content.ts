import { Component } from '@angular/core';
import { Header } from "../header/header";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-content',
  imports: [Header, RouterOutlet],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {

}
