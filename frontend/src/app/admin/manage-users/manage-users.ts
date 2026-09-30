import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-manage-users',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],

  templateUrl: './manage-users.html',

  styleUrl: './manage-users.css'
})
export class ManageUsersComponent
  implements OnInit {


  // ==========================================
  // USERS
  // ==========================================

  users: any[] = [];


  // ==========================================
  // EDIT USER
  // ==========================================

  editingUserId: number | null = null;

  editingUser: any = {

    username: '',

    full_name: '',

    email: '',

    phone: '',

    address: ''

  };


  // ==========================================
  // VALIDATION ERRORS
  // ==========================================

  usernameError = '';

  fullNameError = '';

  emailError = '';

  phoneError = '';

  addressError = '';


  // ==========================================
  // STATES
  // ==========================================

  loading = false;

  saving = false;

  deleting = false;

  errorMessage = '';

  successMessage = '';


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.loadUsers();

  }

goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  // ==========================================
  // LOAD USERS
  // ==========================================

  loadUsers(): void {

    this.loading = true;

    this.errorMessage = '';

    this.authService
      .getAdminUsers()
      .subscribe({

        next: (data: any[]) => {

          console.log(
            'REGISTERED USERS:',
            data
          );

          this.users = [...data];

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error: any) => {

          console.error(
            'LOAD USERS ERROR:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.error?.detail ||
            error?.error?.error ||
            'Unable to load users.';

          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // REFRESH USERS
  // ==========================================

  refreshUsers(): void {

    this.successMessage = '';

    this.errorMessage = '';

    this.loadUsers();

  }


  // ==========================================
  // EDIT USER
  // ==========================================

  editUser(user: any): void {

    this.editingUserId = user.id;

    this.editingUser = {

      username: user.username || '',

      full_name: user.full_name || '',

      email: user.email || '',

      phone: user.phone || '',

      address: user.address || ''

    };

    this.clearValidation();

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // USERNAME VALIDATION
  // ==========================================

  validateUsername(): boolean {

    const username =
      String(
        this.editingUser.username || ''
      ).trim();


    if (!username) {

      this.usernameError =
        'Username is required.';

      return false;

    }


    if (username.length < 3) {

      this.usernameError =
        'Username must contain at least 3 characters.';

      return false;

    }


    if (username.length > 150) {

      this.usernameError =
        'Username cannot exceed 150 characters.';

      return false;

    }


    const usernamePattern =
      /^[a-zA-Z0-9_.-]+$/;


    if (!usernamePattern.test(username)) {

      this.usernameError =
        'Username can contain only letters, numbers, dot, underscore, and hyphen.';

      return false;

    }


    this.usernameError = '';

    return true;

  }


  // ==========================================
  // FULL NAME VALIDATION
  // ==========================================

  validateFullName(): boolean {

    const fullName =
      String(
        this.editingUser.full_name || ''
      ).trim();


    if (!fullName) {

      this.fullNameError =
        'Full name is required.';

      return false;

    }


    if (fullName.length < 2) {

      this.fullNameError =
        'Full name must contain at least 2 characters.';

      return false;

    }


    if (fullName.length > 100) {

      this.fullNameError =
        'Full name cannot exceed 100 characters.';

      return false;

    }


    const namePattern =
      /^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)*$/;


    if (!namePattern.test(fullName)) {

      this.fullNameError =
        'Full name can contain only letters, spaces, hyphens, and apostrophes.';

      return false;

    }


    this.fullNameError = '';

    return true;

  }


  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  validateEmail(): boolean {

    const email =
      String(
        this.editingUser.email || ''
      ).trim();


    if (!email) {

      this.emailError =
        'Email is required.';

      return false;

    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


    if (!emailPattern.test(email)) {

      this.emailError =
        'Please enter a valid email address.';

      return false;

    }


    if (email.length > 254) {

      this.emailError =
        'Email address is too long.';

      return false;

    }


    this.emailError = '';

    return true;

  }


  // ==========================================
  // PHONE VALIDATION
  // ==========================================

  validatePhone(): boolean {

    const phone =
      String(
        this.editingUser.phone || ''
      ).trim();


    // Phone is optional

    if (!phone) {

      this.phoneError = '';

      return true;

    }


    const phonePattern =
      /^[0-9]{10}$/;


    if (!phonePattern.test(phone)) {

      this.phoneError =
        'Phone number must contain exactly 10 digits.';

      return false;

    }


    this.phoneError = '';

    return true;

  }


  // ==========================================
  // ADDRESS VALIDATION
  // ==========================================

  validateAddress(): boolean {

    const address =
      String(
        this.editingUser.address || ''
      ).trim();


    if (!address) {

      this.addressError =
        'Address is required.';

      return false;

    }


    if (address.length < 5) {

      this.addressError =
        'Address must contain at least 5 characters.';

      return false;

    }


    if (address.length > 255) {

      this.addressError =
        'Address cannot exceed 255 characters.';

      return false;

    }


    this.addressError = '';

    return true;

  }


  // ==========================================
  // COMPLETE FORM VALIDATION
  // ==========================================

  validateForm(): boolean {

    const usernameValid =
      this.validateUsername();

    const fullNameValid =
      this.validateFullName();

    const emailValid =
      this.validateEmail();

    const phoneValid =
      this.validatePhone();

    const addressValid =
      this.validateAddress();


    return (
      usernameValid &&
      fullNameValid &&
      emailValid &&
      phoneValid &&
      addressValid
    );

  }


  // ==========================================
  // CHECK FORM VALIDITY
  // ==========================================

  isFormValid(): boolean {

    const username =
      String(
        this.editingUser.username || ''
      ).trim();

    const fullName =
      String(
        this.editingUser.full_name || ''
      ).trim();

    const email =
      String(
        this.editingUser.email || ''
      ).trim();

    const phone =
      String(
        this.editingUser.phone || ''
      ).trim();

    const address =
      String(
        this.editingUser.address || ''
      ).trim();


    // ==========================================
    // USERNAME
    // ==========================================

    if (
      username.length < 3 ||
      username.length > 150
    ) {

      return false;

    }


    if (
      !/^[a-zA-Z0-9_.-]+$/.test(username)
    ) {

      return false;

    }


    // ==========================================
    // FULL NAME
    // ==========================================

    if (
      fullName.length < 2 ||
      fullName.length > 100
    ) {

      return false;

    }


    if (
      !/^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)*$/.test(fullName)
    ) {

      return false;

    }


    // ==========================================
    // EMAIL
    // ==========================================

    if (
      email.length === 0 ||
      email.length > 254
    ) {

      return false;

    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
    ) {

      return false;

    }


    // ==========================================
    // PHONE
    // ==========================================

    // Phone is optional

    if (
      phone &&
      !/^[0-9]{10}$/.test(phone)
    ) {

      return false;

    }


    // ==========================================
    // ADDRESS
    // ==========================================

    if (
      address.length < 5 ||
      address.length > 255
    ) {

      return false;

    }


    return true;

  }


  // ==========================================
  // UPDATE USER
  // ==========================================

  updateUser(): void {

    if (
      this.editingUserId === null
    ) {

      return;

    }


    // Prevent double click

    if (this.saving) {

      return;

    }


    // Validate

    if (!this.validateForm()) {

      return;

    }


    // Clean values

    this.editingUser.username =
      this.editingUser.username.trim();

    this.editingUser.full_name =
      this.editingUser.full_name.trim();

    this.editingUser.email =
      this.editingUser.email.trim();

    this.editingUser.phone =
      this.editingUser.phone.trim();

    this.editingUser.address =
      this.editingUser.address.trim();


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    const userId =
      this.editingUserId;


    const data = {

      username:
        this.editingUser.username,

      full_name:
        this.editingUser.full_name,

      email:
        this.editingUser.email,

      phone:
        this.editingUser.phone,

      address:
        this.editingUser.address

    };


    this.authService
      .updateAdminUser(
        userId,
        data
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'USER UPDATED:',
            response
          );


          this.saving = false;

          this.editingUserId = null;

          this.resetEditingUser();

          this.clearValidation();


          this.successMessage =
            'User updated successfully.';


          this.loadUsers();

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'UPDATE USER ERROR:',
            error
          );


          this.saving = false;


          this.errorMessage =
            error?.error?.username?.[0] ||
            error?.error?.email?.[0] ||
            error?.error?.phone?.[0] ||
            error?.error?.detail ||
            error?.error?.error ||
            'Unable to update user.';


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // DELETE USER
  // ==========================================

  deleteUser(user: any): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete "${user.username}"?`
      );


    if (!confirmed) {

      return;

    }


    this.deleting = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.authService
      .deleteAdminUser(
        user.id
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'USER DELETED:',
            response
          );


          this.deleting = false;


          this.successMessage =
            'User deleted successfully.';


          this.loadUsers();

          this.cdr.detectChanges();

        },


        error: (error: any) => {

          console.error(
            'DELETE USER ERROR:',
            error
          );


          this.deleting = false;


          this.errorMessage =
            error?.error?.error ||
            error?.error?.detail ||
            'Unable to delete user.';


          this.cdr.detectChanges();

        }

      });

  }


  // ==========================================
  // RESET EDITING USER
  // ==========================================

  resetEditingUser(): void {

    this.editingUser = {

      username: '',

      full_name: '',

      email: '',

      phone: '',

      address: ''

    };

  }


  // ==========================================
  // CLEAR VALIDATION
  // ==========================================

  clearValidation(): void {

    this.usernameError = '';

    this.fullNameError = '';

    this.emailError = '';

    this.phoneError = '';

    this.addressError = '';

  }


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  cancelEdit(): void {

    this.editingUserId = null;

    this.resetEditingUser();

    this.clearValidation();

    this.errorMessage = '';

    this.cdr.detectChanges();

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}