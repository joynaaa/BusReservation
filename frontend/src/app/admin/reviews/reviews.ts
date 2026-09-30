import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-reviews',
  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './reviews.html',
  styleUrl: './reviews.css'
})
export class ReviewsComponent implements OnInit {

  reviews: any[] = [];

  loading = true;

  errorMessage = '';


  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.loadReviews();

  }

goToDashboard(): void {
  this.router.navigate(['/admin/dashboard']);
}
  // ==========================================
  // LOAD REVIEWS
  // ==========================================

  loadReviews(): void {

    this.loading = true;

    this.errorMessage = '';


    this.authService.getAdminReviews().subscribe({

      next: (data: any[]) => {

        console.log(
          'ADMIN REVIEWS API RESPONSE:',
          data
        );

        this.reviews = data || [];

        this.loading = false;

        this.cdr.detectChanges();

      },


      error: (error: any) => {

        console.error(
          'ADMIN REVIEWS API ERROR:',
          error
        );

        this.loading = false;

        if (error.status === 401) {

          this.errorMessage =
            'Your login session has expired. Please login again.';

        }

        else if (error.status === 403) {

          this.errorMessage =
            'You do not have permission to access reviews.';

        }

        else {

          this.errorMessage =
            'Unable to load reviews. Please try again.';

        }

        this.cdr.detectChanges();

      }

    });

  }


  // ==========================================
  // DELETE REVIEW
  // ==========================================

  deleteReview(id: number): void {

    const confirmed = confirm(
      'Are you sure you want to delete this review?'
    );


    if (!confirmed) {

      return;

    }


    this.authService.deleteAdminReview(id).subscribe({

      next: (response: any) => {

        console.log(
          'DELETE REVIEW RESPONSE:',
          response
        );

        alert(
          'Review deleted successfully.'
        );

        this.loadReviews();

      },


      error: (error: any) => {

        console.error(
          'DELETE REVIEW ERROR:',
          error
        );

        if (error.status === 401) {

          alert(
            'Your login session has expired. Please login again.'
          );

        }

        else if (error.status === 403) {

          alert(
            'You do not have permission to delete reviews.'
          );

        }

        else {

          alert(
            'Unable to delete review.'
          );

        }

      }

    });

  }

}