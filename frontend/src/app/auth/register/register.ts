import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth';

@Component({
selector: 'app-register',
standalone: true,
imports: [
FormsModule,
CommonModule,
RouterLink
],
styleUrl: './register.css',
templateUrl: './register.html',
})
export class RegisterComponent {

username = '';
email = '';
password = '';
password2 = '';

message = '';
errorMessage = '';

constructor(
private authService: AuthService,
private router: Router
) {}

// At least 8 characters
hasMinimumLength(): boolean {
return this.password.length >= 8;
}

// At least one letter
hasLetter(): boolean {
return /[A-Za-z]/.test(this.password);
}

// At least one number
hasNumber(): boolean {
return /[0-9]/.test(this.password);
}

// At least one special character
hasSpecialCharacter(): boolean {
return /[^A-Za-z0-9]/.test(this.password);
}

// Check all password requirements
isPasswordValid(): boolean {
return (
this.hasMinimumLength() &&
this.hasLetter() &&
this.hasNumber() &&
this.hasSpecialCharacter()
);
}

register(): void {

this.message = '';
this.errorMessage = '';

// Username validation
if (!this.username.trim()) {
  this.errorMessage = 'Username is required.';
  return;
}

if (this.username.trim().length < 3) {
  this.errorMessage =
    'Username must be at least 3 characters.';
  return;
}

// Email validation
const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(this.email)) {
  this.errorMessage =
    'Please enter a valid email address.';
  return;
}

// Password validation
if (!this.isPasswordValid()) {
  this.errorMessage =
    'Password must contain at least 8 characters, one letter, one number, and one special character.';
  return;
}

// Confirm password
if (this.password !== this.password2) {
  this.errorMessage =
    'Passwords do not match.';
  return;
}

const data = {
  username: this.username.trim(),
  email: this.email.trim(),
  password: this.password,
  password2: this.password2
};

console.log('REGISTER DATA:', data);

this.authService.register(data).subscribe({

  next: (response) => {

    console.log('Registration response:', response);

    this.message =
      'Registration successful!';

    this.errorMessage = '';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);

  },

  error: (error) => {

    console.error(
      'Registration error:',
      error
    );

    this.message = '';

    if (error.error) {

      if (typeof error.error === 'string') {
        this.errorMessage = error.error;
      } else if (error.error.error) {
        this.errorMessage = error.error.error;
      } else if (error.error.detail) {
        this.errorMessage = error.error.detail;
      } else {
        this.errorMessage =
          Object.values(error.error).flat().join(' ');
      }

    } else {

      this.errorMessage =
        'Registration failed. Please try again.';

    }

  }

});

}
}
