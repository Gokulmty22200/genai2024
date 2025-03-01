import { Component, Inject } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './side-login.component.html',
  styleUrl: './side-login.component.scss',
})
export class AppSideLoginComponent {
  constructor(
    private router: Router,
    @Inject(AuthService) private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(5)]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid) {
      const { uname, password } = this.form.value;
      if (this.authService.login(uname || '', password || '')) {
        this.router.navigate(['/']);
      } else {
        this.snackBar.open('Invalid credentials', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      }
    }
  }
}