import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Login } from './login/login';


import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [Login],

  imports: [
    CommonModule,
    AdminRoutingModule,
    MatButtonModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule
  ]
})
export class AdminModule { }
