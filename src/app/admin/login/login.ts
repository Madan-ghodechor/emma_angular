import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Api } from '../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  hide = true;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private api: Api, private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.api.getLoggedIn(this.form.value).subscribe({
      next: (res: any) => {
        if (res.success) {
          localStorage.setItem('adminToken', res.data.token)
          this.router.navigate(['/admin/dashboard'])
        }
      }
    })

  }
}
