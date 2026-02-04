import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-registration',
  standalone: true,
  templateUrl: './registration.html',
  styleUrls: ['./registration.scss'],
  imports: [MatRadioModule, FormsModule]
})
export class Registration {

  favoriteSeason = '';
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];

}
