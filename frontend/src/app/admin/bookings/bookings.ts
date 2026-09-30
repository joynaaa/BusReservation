import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-bookings',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './bookings.html',

  styleUrl: './bookings.css'
})


export class BookingsComponent implements OnInit {

  bookings: any[] = [];

  loading = false;


  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.loadBookings();

  }
goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
loadBookings(): void {

  this.loading = true;

  this.bookings = [];

  this.authService.getAdminBookings().subscribe({

    next: (response: any[]) => {

      console.log(
        'ADMIN BOOKINGS:',
        response
      );

      this.bookings = [...response];

      this.loading = false;

      this.cdr.detectChanges();

    },

    error: (error) => {

      console.error(
        'LOAD BOOKINGS ERROR:',
        error
      );

      this.loading = false;

      this.cdr.detectChanges();

      if (error.status === 401) {

        alert(
          'Please login as admin.'
        );

      }

      else if (error.status === 403) {

        alert(
          'You do not have admin permission.'
        );

      }

      else {

        alert(
          'Unable to load bookings.'
        );

      }

    }

  });

}
}