import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router , RouterLink} from '@angular/router';

import { AuthService } from '../../core/services/auth';

@Component({
  imports: [FormsModule, CommonModule, RouterLink],
   standalone: true,
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginComponent {

  username = '';
  password = '';

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    const data = {
      username: this.username,
      password: this.password
    };
this.authService.login(this.username, this.password).subscribe({
  next: (response: any) => {

    console.log('LOGIN RESPONSE:', response);

    localStorage.setItem('access', response.access);
    localStorage.setItem('refresh', response.refresh);
    localStorage.setItem('username', response.username);
    localStorage.setItem('role', response.role);

    if (response.role === 'OPERATOR') {
      this.router.navigate(['/operator/dashboard']);

    } else if (response.role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);

    } else {
      this.router.navigate(['/home']);
    }
  },

  error: (error) => {

    console.error('LOGIN ERROR:', error);

    if (error.status === 403) {
      alert(error.error?.error || 'Your account is not approved.');

    } else if (error.status === 401) {
      alert('Invalid username or password.');

    } else {
      alert('Unable to login. Please try again.');
    }
  }
});
  }
}