import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';

import { ProfileService } from '../../core/services/profile';


@Component({
  selector: 'app-profile',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './profile.html',

  styleUrl: './profile.css'
})


export class ProfileComponent implements OnInit {


  // =========================================================
  // PROFILE DATA
  // =========================================================

  profile: any = {};


  // =========================================================
  // STATE
  // =========================================================

  loading = true;

  editing = false;

  saving = false;


  // =========================================================
  // MESSAGES
  // =========================================================

  message = '';

  errorMessage = '';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  // =========================================================
  // INITIALIZE
  // =========================================================

  ngOnInit(): void {

    this.loadProfile();

  }


  // =========================================================
  // LOAD PROFILE
  // =========================================================

  loadProfile(): void {

    this.loading = true;

    this.message = '';

    this.errorMessage = '';


    this.profileService
      .getProfile()
      .subscribe({

        next: (response) => {

          console.log(
            'PROFILE RESPONSE:',
            response
          );


          this.profile = response || {};


          this.loading = false;


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'PROFILE ERROR:',
            error
          );


          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            error.error?.message ||
            'Unable to load profile.';


          this.loading = false;


          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // EDIT PROFILE
  // =========================================================

  editProfile(): void {

    this.editing = true;

    this.message = '';

    this.errorMessage = '';

  }


  // =========================================================
  // CANCEL EDIT
  // =========================================================

  cancelEdit(): void {

    this.editing = false;

    this.message = '';

    this.errorMessage = '';

    this.loadProfile();

  }


  // =========================================================
  // FULL NAME VALIDATION
  // =========================================================

  isFullNameValid(): boolean {

    const name =
      (this.profile.full_name || '').trim();


    return (
      name.length >= 3 &&
      /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(name)
    );

  }


  // =========================================================
  // PHONE VALIDATION
  // =========================================================

  isPhoneValid(): boolean {

    const phone =
      (this.profile.phone || '').trim();


    return /^[6-9][0-9]{9}$/.test(phone);

  }


  // =========================================================
  // ADDRESS VALIDATION
  // =========================================================

  isAddressValid(): boolean {

    const address =
      (this.profile.address || '').trim();


    return address.length >= 10;

  }


  // =========================================================
  // FORM VALIDATION
  // =========================================================

  isFormValid(): boolean {

    return (
      this.isFullNameValid() &&
      this.isPhoneValid() &&
      this.isAddressValid()
    );

  }


  // =========================================================
  // SAVE PROFILE
  // =========================================================

  saveProfile(): void {

    this.message = '';

    this.errorMessage = '';


    // -------------------------------------------------------
    // FRONTEND VALIDATION
    // -------------------------------------------------------

    if (!this.isFullNameValid()) {

      this.errorMessage =
        'Please enter a valid full name.';

      return;

    }


    if (!this.isPhoneValid()) {

      this.errorMessage =
        'Phone number must contain exactly 10 digits and start with 6, 7, 8 or 9.';

      return;

    }


    if (!this.isAddressValid()) {

      this.errorMessage =
        'Address must contain at least 10 characters.';

      return;

    }


    // -------------------------------------------------------
    // UPDATE DATA
    // -------------------------------------------------------

    const data = {

      full_name:
        this.profile.full_name.trim(),

      phone:
        this.profile.phone.trim(),

      address:
        this.profile.address.trim()

    };


    console.log(
      'PROFILE UPDATE DATA:',
      data
    );


    this.saving = true;


    // -------------------------------------------------------
    // API CALL
    // -------------------------------------------------------

    this.profileService
      .updateProfile(data)
      .subscribe({

        next: (response) => {

          console.log(
            'PROFILE UPDATED:',
            response
          );


          this.profile =
            response.profile || response;


          this.editing = false;

          this.saving = false;

          this.message =
            'Profile updated successfully!';


          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'UPDATE PROFILE ERROR:',
            error
          );


          this.saving = false;


          this.errorMessage =
            error.error?.detail ||
            error.error?.error ||
            error.error?.message ||
            'Unable to update profile. Please try again.';


          this.cdr.detectChanges();

        },


        complete: () => {

          // Safety check

          this.saving = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // GO HOME
  // =========================================================

  goHome(): void {

    this.router.navigate([
      '/home'
    ]);

  }


  // =========================================================
  // GO TO BOOKINGS
  // =========================================================

  goToBookings(): void {

    this.router.navigate([
      '/my-bookings'
    ]);

  }

}